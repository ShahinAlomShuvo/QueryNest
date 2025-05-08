"use client";

import { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  onUploadSuccess: (fileName: string) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileType = file.name.split(".").pop()?.toLowerCase();

      // Validate file type
      if (fileType === "pdf" || fileType === "txt") {
        setSelectedFile(file);
        setError(null);
      } else {
        setSelectedFile(null);
        setError("Please select a PDF or text file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onUploadSuccess(data.fileName);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
      <div className="flex flex-col items-center gap-2">
        {!selectedFile ? (
          <>
            <Upload className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" />
            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
              Upload a PDF or text file to ask questions about it
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </label>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#8e24aa]" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={cancelSelection}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <span>Upload File</span>
                )}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
