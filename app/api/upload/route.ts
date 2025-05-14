/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const conversationId = formData.get("conversationId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "No conversation ID provided" },
        { status: 400 },
      );
    }

    // Get file content as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process based on file type
    let textContent = "";

    if (file.name.toLowerCase().endsWith(".pdf")) {
      // For PDF files
      const pdf = require("pdf-parse/lib/pdf-parse.js");
      const pdfData = await pdf(buffer);

      textContent = pdfData.text;
    } else {
      // For text files
      textContent = buffer.toString("utf-8");
    }

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.createDocuments([textContent]);

    // Add metadata to each document
    const docsWithMetadata = docs.map((doc) => ({
      ...doc,
      metadata: {
        fileName: file.name,
        conversationId: String(conversationId),
        uploadedAt: new Date().toISOString(),
      },
    }));

    console.log("Uploading docsWithMetadata:", docsWithMetadata);

    // Initialize embeddings with Gemini
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "models/embedding-001",
    });

    // Store vectors in PostgreSQL
    await PGVectorStore.fromDocuments(docsWithMetadata, embeddings, {
      postgresConnectionOptions: {
        connectionString: process.env.DATABASE_URL!,
      },
      tableName: "Document",
      columns: {
        idColumnName: "id",
        contentColumnName: "content",
        vectorColumnName: "embedding",
      },
    });

    // Update conversation to mark it has an attachment
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { hasAttachment: true },
    });

    console.log(
      "Successfully embedded and saved uploaded document with conversationId:",
      conversationId,
    );

    return NextResponse.json({
      success: true,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Error processing file:", error);

    return NextResponse.json(
      { error: error.message || "Error processing file" },
      { status: 500 },
    );
  }
}
