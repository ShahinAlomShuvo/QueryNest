/* eslint-disable no-console */

export const readPdfFromFile = async (filePath: string): Promise<string> => {
  try {
    const fs = require("fs");
    const pdf = require("pdf-parse/lib/pdf-parse.js");

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
