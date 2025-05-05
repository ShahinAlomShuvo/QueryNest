/* eslint-disable no-console */
import { readdirSync } from "fs";

import { Document } from "langchain/document";

import { createDocsDirectory } from "../utils/directories";

import { readPdfFromFile } from "./pdfParser";
import { readTextFromFile } from "./textParser";

export const readContentFromFile = async (
  filePath: string
): Promise<string> => {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith(".pdf")) {
    return readPdfFromFile(filePath);
  } else if (lowerPath.endsWith(".txt")) {
    return readTextFromFile(filePath);
  } else {
    throw new Error(`Unsupported file type: ${filePath}`);
  }
};

export const loadAllDocuments = async (): Promise<Document[]> => {
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
