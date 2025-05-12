import { Bot, User, FileText } from "lucide-react";
import React from "react";

import { MarkdownRenderer } from "../ui/markdown-renderer";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  fileAttachment?: string;
  createdAt?: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {messages.map((message, index) => (
        <div
          key={message.id || index}
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
                      {message.fileAttachment}
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
  );
};
