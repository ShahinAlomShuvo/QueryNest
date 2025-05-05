"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { Send, Bot, User } from "../icons";

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
    <div className="flex flex-col h-[85vh] bg-[#f8f9fa] dark:bg-[#1f1f1f] rounded-xl overflow-hidden shadow-lg max-w-4xl mx-auto">
      <div className="p-4 bg-[#8e24aa] text-white flex items-center gap-2">
        <Bot className="w-6 h-6" />
        <h2 className="text-xl font-semibold">QueryNest AI</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6 bg-white dark:bg-[#2d2d2d] relative">
        {messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md p-6 rounded-xl bg-[#f3f3f3] dark:bg-[#383838]">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-[#8e24aa] flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Welcome to QueryNest
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                I can answer questions based on all the documents in the system.
                What would you like to know?
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="p-2 rounded-full bg-[#8e24aa] flex-shrink-0">
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
                    ? "bg-[#e9e9fd] text-[#1a1a1a] rounded-tr-none"
                    : "bg-[#f3f3f3] dark:bg-[#383838] rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            {message.role === "user" && (
              <div className="p-2 rounded-full bg-[#4285f4] flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
            <div className="p-2 rounded-full bg-[#8e24aa] flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col max-w-[80%] items-start">
              <div className="p-4 rounded-2xl bg-[#f3f3f3] dark:bg-[#383838] rounded-tl-none">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        className="p-4 border-t bg-white dark:bg-[#2d2d2d] flex gap-2"
        onSubmit={handleSubmit}
      >
        <Input
          className="flex-1 bg-[#f3f3f3] dark:bg-[#383838] rounded-xl"
          disabled={isLoading}
          placeholder="Ask me about your documents..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          className="min-w-10 rounded-full"
          color="secondary"
          disabled={isLoading || !input.trim()}
          type="submit"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
