/* eslint-disable no-console */
"use server";

import { askWithRAG } from "./rag";

// Get list of available document files from local directory
// export async function getAvailablePdfs() {
//   const docsDir = join(process.cwd(), "public", "docs");

//   try {
//     // Read all files from docs directory
//     const files = readdirSync(docsDir);

//     // Filter only supported document files
//     const supportedFiles = files.filter(
//       (file) =>
//         file.toLowerCase().endsWith(".pdf") ||
//         file.toLowerCase().endsWith(".txt") ||
//         file.toLowerCase().endsWith(".docx") ||
//         file.toLowerCase().endsWith(".doc")
//     );

//     // Return serializable data
//     return supportedFiles.map((file) => ({
//       fileName: file,
//       filePath: join(docsDir, file),
//     }));
//   } catch (error) {
//     console.error("Error reading docs directory:", error);

//     return [];
//   }
// }

// Process RAG query against all documents
export async function processAllDocsQuery(formData: FormData) {
  const question = formData.get("question") as string;

  if (!question) {
    return {
      error: "Please enter a question",
    };
  }

  try {
    const result = await askWithRAG(question);

    // Return serializable result
    return {
      text: result.text,
      sources: Array.isArray(result.sourceDocs)
        ? result.sourceDocs.map((doc) => ({
            content:
              typeof doc.pageContent === "string"
                ? doc.pageContent
                : "Content not available",
            source: doc.metadata?.source || "Unknown source",
          }))
        : [],
    };
  } catch (error: any) {
    console.error("Error processing RAG query:", error);

    return {
      error: error.message || "There was a problem generating an answer",
    };
  }
}
