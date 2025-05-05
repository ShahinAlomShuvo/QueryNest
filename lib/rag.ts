/* eslint-disable no-console */
// lib/rag.ts
import { readdirSync } from "fs";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";

// Function to create a docs directory if it doesn't exist
const createDocsDirectory = async () => {
  try {
    const fs = require("fs");
    const path = require("path");

    const docsDir = path.join(process.cwd(), "public", "docs");

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      console.log("Created docs directory at", docsDir);
    }

    return docsDir;
  } catch (error) {
    console.error("Error creating docs directory:", error);
    throw error;
  }
};

// Function to read content from a text file
const readTextFromFile = async (filePath: string): Promise<string> => {
  try {
    const fs = require("fs");

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read the file
    const content = fs.readFileSync(filePath, "utf8");

    return content;
  } catch (error: any) {
    console.error("Error reading text file:", error);
    throw error;
  }
};

// Function to read content from a PDF file
const readPdfFromFile = async (filePath: string): Promise<string> => {
  try {
    const fs = require("fs");
    const pdf = require("pdf-parse/lib/pdf-parse.js"); // Direct require to avoid test data loading

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read PDF file buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF to text with options to avoid test files
    const pdfData = await pdf(dataBuffer, {
      max: 0, // No page limit
      version: "v1.10.100", // Use specific version to avoid test file checks
    });

    return pdfData.text || "";
  } catch (error: any) {
    console.error(`Error reading PDF file ${filePath}:`, error.message);
    throw error;
  }
};

// Function to read content from any supported file
const readContentFromFile = async (filePath: string): Promise<string> => {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith(".pdf")) {
    return readPdfFromFile(filePath);
  } else if (lowerPath.endsWith(".txt")) {
    return readTextFromFile(filePath);
  } else {
    throw new Error(`Unsupported file type: ${filePath}`);
  }
};

// Function to load all documents from the docs directory
const loadAllDocuments = async (): Promise<Document[]> => {
  try {
    const docsDir = await createDocsDirectory();
    const path = require("path");

    // Get all files in directory
    const files = readdirSync(docsDir);

    // Filter for supported file types
    const supportedFiles = files.filter((file) => {
      const lowerFile = file.toLowerCase();

      return lowerFile.endsWith(".txt") || lowerFile.endsWith(".pdf");
    });

    // Load content from each file
    const documents: Document[] = [];

    for (const file of supportedFiles) {
      try {
        const filePath = path.join(docsDir, file);
        const content = await readContentFromFile(filePath);

        if (content && content.trim() !== "") {
          documents.push(
            new Document({
              pageContent: content,
              metadata: { source: filePath },
            })
          );
          console.log(`Successfully loaded: ${filePath}`);
        } else {
          console.warn(`Empty content in file: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
      }
    }

    return documents;
  } catch (error) {
    console.error("Error loading all documents:", error);

    return [];
  }
};

// Main RAG function that can work with a specific file or all files
export async function askWithRAG(question: string, filePath?: string) {
  try {
    // Ensure docs directory exists
    await createDocsDirectory();

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

    // Split text into manageable chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Create embeddings and store in vector database
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "models/embedding-001",
    });

    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    // Create prompt template for the LLM
    const prompt = ChatPromptTemplate.fromTemplate(`
      Answer the question based only on the following context:
      <context>
      {context}
      </context>

      Question: {input}
      
      If the answer is not in the context, just say "I don't have information about that in the provided documents."
    `);

    // Initialize the Gemini LLM
    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-pro",
      temperature: 0.2,
    });

    // Create document processing chain
    const documentChain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser(),
    });

    // Create retrieval chain
    const retriever = vectorstore.asRetriever();
    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever,
    });

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
