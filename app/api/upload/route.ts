import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), "temp-uploads");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported" },
        { status: 400 }
      );
    }

    // Create a unique filename to prevent overwrites
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const filePath = join(tempDir, uniqueFileName);

    // Convert the file to buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName: uniqueFileName,
      filePath,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
