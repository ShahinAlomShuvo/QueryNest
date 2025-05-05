/* eslint-disable no-console */
import { Document } from "langchain/document";

import { loadAllDocuments, readContentFromFile } from "../parsers/fileParser";

import { createRagChain } from "./llmChain";

export async function askWithRAG(question: string, filePath?: string) {
  try {
    // Load document(s)
    let docs: Document[] = [];

    if (filePath) {
      // Single file mode
      const content = await readContentFromFile(filePath);

      if (!content) {
        return { text: "No content found in the document.", sourceDocs: [] };
      }

      docs = [
        new Document({
          pageContent: content,
          metadata: { source: filePath },
        }),
      ];
    } else {
      // All documents mode
      docs = await loadAllDocuments();

      if (docs.length === 0) {
        return {
          text: "No documents found in the docs directory. Please add some documents first.",
          sourceDocs: [],
        };
      }
    }

    // Create and invoke the RAG chain
    const retrievalChain = await createRagChain(docs);

    // Process the question and get answer
    const result = await retrievalChain.invoke({
      input: question,
    });

    return {
      text: result.answer,
      sourceDocs: result.context || [],
    };
  } catch (error: any) {
    console.error("Error in RAG processing:", error);

    return {
      text: "Error processing your request. Please check if the file is valid and try again.",
      error: error.message || "Unknown error",
    };
  }
}
