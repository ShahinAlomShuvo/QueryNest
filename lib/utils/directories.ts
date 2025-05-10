/* eslint-disable no-console */

export const createDocsDirectory = async (): Promise<string> => {
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
