import { Button } from "@heroui/button";
import { Send, Paperclip, Loader2, X, FileText } from "lucide-react";
import React from "react";

interface PendingFile {
  name: string;
  path: string;
  fullPath: string;
}

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  isUploading: boolean;
  pendingFile: PendingFile | null;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePendingFile: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleSubmit: (e: React.FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  isUploading,
  pendingFile,
  onFileSelect,
  onFileChange,
  removePendingFile,
  textareaRef,
  fileInputRef,
  handleSubmit,
}) => {
  return (
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
        className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm"
        onSubmit={handleSubmit}
      >
        <input
          ref={fileInputRef}
          accept=".pdf,.txt"
          className="hidden"
          type="file"
          onChange={onFileChange}
        />
        <Button
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full flex-shrink-0 w-10 h-10 p-0 flex items-center justify-center"
          disabled={isUploading || isLoading || !!pendingFile}
          type="button"
          variant="ghost"
          onClick={onFileSelect}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>
        <textarea
          ref={textareaRef}
          className="flex-1 min-h-[40px] max-h-[120px] border-0 shadow-none focus-visible:ring-0 bg-transparent resize-none py-2 px-3 overflow-y-auto"
          disabled={isLoading || isUploading}
          placeholder={
            isUploading
              ? "Uploading file..."
              : pendingFile
                ? "Ask about this file..."
                : "Ask me anything..."
          }
          rows={1}
          style={{ height: "auto" }}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Auto-resize the textarea
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          color="secondary"
          disabled={isLoading || isUploading || (!input.trim() && !pendingFile)}
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
  );
};
