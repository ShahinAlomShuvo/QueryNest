import { join } from "path";

import { NextRequest, NextResponse } from "next/server";

import { askWithRAG } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const question = formData.get("question") as string;
    const fileName = formData.get("fileName") as string;
    const filePath = formData.get("filePath") as string;

    if (!question) {
      return NextResponse.json(
        { error: "Please provide a question" },
        { status: 400 }
      );
    }

    // Either filePath or fileName must be provided
    if (!filePath && !fileName) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 });
    }

    let fullPath = "";

    // If direct filePath is provided, use it (for temp files)
    if (filePath) {
      fullPath = filePath;
    } else {
      // For backward compatibility with older stored files
      const docsDir = join(process.cwd(), "public", "docs");

      fullPath = join(docsDir, fileName);
    }

    // Process the question against the specific file
    const result = await askWithRAG(question, fullPath);

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Error processing file chat query:", error);

    return NextResponse.json(
      { error: error.message || "Error processing your request" },
      { status: 500 }
    );
  }
}
