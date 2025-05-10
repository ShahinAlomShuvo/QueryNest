"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Send, Bot, User, Paperclip, Loader2, X, FileText } from "lucide-react";

import { MarkdownRenderer } from "../ui/markdown-renderer";

import { processAllDocsQuery } from "@/lib/actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  fileAttachment?: {
    name: string;
    path: string;
  };
}

export function AutoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    name: string;
    path: string;
    fullPath: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePendingFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileType = file.name.split(".").pop()?.toLowerCase();

      // Validate file type
      if (fileType !== "pdf" && fileType !== "txt") {
        alert("Please select a PDF or text file.");

        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          // Set as pending file (don't add to chat yet)
          setPendingFile({
            name: file.name,
            path: data.fileName,
            fullPath: data.filePath,
          });
        } else {
          alert(data.error || "Failed to upload file");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred while uploading the file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if we have either input text or a pending file
    if (!input.trim() && !pendingFile) return;

    let userContent = input.trim();

    // If there's no input but there is a file, use a default question
    if (!userContent && pendingFile) {
      userContent = "Please analyze this document";
    }

    // Add user message with pending file if it exists
    const userMessage: Message = {
      role: "user",
      content: userContent,
      ...(pendingFile && {
        fileAttachment: { name: pendingFile.name, path: pendingFile.path },
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create form data for server action
      const formData = new FormData();

      formData.append("question", userContent);

      // If there's a pending file, use it for the query
      if (pendingFile) {
        formData.append("filePath", pendingFile.fullPath);

        // Call file-specific chat API
        const response = await fetch("/api/file-chat", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        const responseText = result.error
          ? result.error
          : result.text || "No answer could be found.";

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseText },
        ]);

        // Clear pending file after sending
        setPendingFile(null);
      } else {
        // Regular RAG query
        const result = await processAllDocsQuery(formData);

        // Extract text or error message
        const responseText =
          "error" in result
            ? result.error
            : result.text || "No answer could be found.";

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseText },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, an error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#8e24aa] flex items-center justify-center mb-6">
              <Bot className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">QueryNest</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md text-center mb-8">
              I can answer questions based on your documents. What would you
              like to know?
            </p>
          </div>
        )}

        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#8e24aa] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`flex flex-col max-w-[80%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-[#e9e9fd] dark:bg-[#4a4a7c] text-[#1a1a1a] dark:text-white rounded-tr-none"
                      : "bg-[#f3f3f3] dark:bg-[#383838] rounded-tl-none"
                  }`}
                >
                  {message.fileAttachment && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {message.fileAttachment.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {message.role === "assistant" ? (
                    <MarkdownRenderer
                      className="prose prose-sm dark:prose-invert max-w-none"
                      content={message.content}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#4285f4] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#8e24aa] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col max-w-[80%] items-start">
                <div className="p-4 rounded-2xl bg-[#f3f3f3] dark:bg-[#383838] rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    <div
                      className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          {pendingFile && (
            <div className="flex items-center gap-2 mb-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                Added file: {pendingFile.name}
              </span>
              <button
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"
                onClick={removePendingFile}
              >
                <X className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </button>
            </div>
          )}
          <form
            className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2"
            onSubmit={handleSubmit}
          >
            <input
              ref={fileInputRef}
              accept=".pdf,.txt"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
            <Button
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full flex-shrink-0 w-10 h-10 p-0 flex items-center justify-center"
              disabled={isUploading || isLoading || !!pendingFile}
              type="button"
              variant="ghost"
              onClick={handleFileSelect}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </Button>
            <Input
              className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent"
              disabled={isLoading || isUploading}
              placeholder={
                isUploading
                  ? "Uploading file..."
                  : pendingFile
                    ? "Ask about this file..."
                    : "Ask me anything..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
              color="secondary"
              disabled={
                isLoading || isUploading || (!input.trim() && !pendingFile)
              }
              type="submit"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-center mt-2 text-gray-500">
            {pendingFile
              ? "Enter your question and press send"
              : "Upload a file or ask a question about your documents"}
          </p>
        </div>
      </div>
    </div>
  );
}
