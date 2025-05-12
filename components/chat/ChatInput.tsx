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
    <div className="max-w-4xl mx-auto px-4">
      {pendingFile && (
        <div className="flex items-center gap-2 mb-3 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800">
          <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300 flex-1">
            Added file: {pendingFile.name}
          </span>
          <button
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
            onClick={removePendingFile}
          >
            <X className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </button>
        </div>
      )}
      <form className="relative group" onSubmit={handleSubmit}>
        <div className="relative flex flex-col bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
          <textarea
            ref={textareaRef}
            className="w-full min-h-[100px] max-h-[300px] border-0 outline-none focus:outline-none focus:ring-0 bg-transparent resize-none py-4 px-4 overflow-y-auto text-base placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isLoading || isUploading}
            placeholder={
              isUploading
                ? "Uploading file..."
                : pendingFile
                  ? "Ask about this file..."
                  : "Message QueryNest..."
            }
            rows={1}
            style={{ height: "auto" }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize the textarea
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 300) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-between items-center p-2">
            <input
              ref={fileInputRef}
              accept=".pdf,.txt"
              className="hidden"
              type="file"
              onChange={onFileChange}
            />
            <Button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg flex-shrink-0 w-10 h-10 p-0 flex items-center justify-center"
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
            <Button
              className={`rounded-lg w-10 h-10 p-0 flex items-center justify-center ${
                !input.trim() && !pendingFile
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
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
          </div>
        </div>
      </form>
    </div>
  );
};
