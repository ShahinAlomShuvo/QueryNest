"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { Send, Bot, User } from "../icons";
import { MarkdownRenderer } from "../ui/markdown-renderer";

import { processAllDocsQuery } from "@/lib/actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AutoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create form data for server action
      const formData = new FormData();

      formData.append("question", input);

      // Call server action
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
          <form
            className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2"
            onSubmit={handleSubmit}
          >
            <Input
              className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent"
              disabled={isLoading}
              placeholder="Ask me about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
              color="secondary"
              disabled={isLoading || !input.trim()}
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
            QueryNest processes your documents using AI to provide accurate
            answers
          </p>
        </div>
      </div>
    </div>
  );
}
