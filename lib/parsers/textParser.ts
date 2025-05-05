/* eslint-disable no-console */

/**
 * Reads content from a text file
 * @param filePath Path to the text file
 * @returns The content of the text file
 */
export const readTextFromFile = async (filePath: string): Promise<string> => {
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
    console.error(`Error reading text file ${filePath}:`, error.message);
    throw error;
  }
};
