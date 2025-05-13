/* eslint-disable no-console */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bot, Loader2 } from "lucide-react";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

import {
  getConversation,
  addMessageToConversation,
  processAllDocsQuery,
  updateConversationTitle,
} from "@/lib/actions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  fileAttachment?: string;
  createdAt: Date;
}

interface ConversationData {
  id: string;
  title: string;
  userId: string;
  hasAttachment?: boolean;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

function LoadingUI() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">
        Loading conversation...
      </p>
    </div>
  );
}

function ErrorUI({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <p className="text-red-500">{error}</p>
      <Button className="mt-4" color="secondary" onClick={onBack}>
        Go back to Chat
      </Button>
    </div>
  );
}

function WelcomeUI() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-[#8e24aa] flex items-center justify-center mb-6">
        <Bot className="w-9 h-9 text-white" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">QueryNest</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md text-center mb-8">
        I can answer questions based on your documents. What would you like to
        know?
      </p>
    </div>
  );
}

export function ConversationChat({
  conversationId,
}: {
  conversationId: string;
}) {
  const [conversation, setConversation] = useState<ConversationData | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [pendingFile, setPendingFile] = useState<{
    name: string;
    path: string;
    fullPath: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load conversation data
  useEffect(() => {
    async function loadConversation() {
      try {
        setIsInitializing(true);
        const result = await getConversation(conversationId);

        if (result.success && result.conversation) {
          setConversation(result.conversation as any);
          setMessages(result.conversation.messages as any[]);
        } else {
          setError(result.error || "Failed to load conversation");

          // If conversation not found, redirect to chat home
          if (result.error === "Conversation not found") {
            router.push("/chat");
          }
        }
      } catch (error: any) {
        setError(error.message || "An error occurred loading the conversation");
      } finally {
        setIsInitializing(false);
      }
    }

    if (conversationId) {
      loadConversation();
    }
  }, [conversationId, router]);

  useEffect(() => {
    scrollToBottom();
    if (isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      // File size validation
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert("File too large. Maximum size is 10MB");

        return;
      }

      // File type validation
      const fileType = file.name.split(".").pop()?.toLowerCase();

      if (fileType !== "pdf" && fileType !== "txt") {
        alert("Please select a PDF or text file.");

        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("conversationId", conversationId);

        // Upload and process file
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();

          throw new Error(error.error || "Failed to process file");
        }

        await response.json();

        // Set as pending file (just for UI, we don't store the actual file)
        setPendingFile({
          name: file.name,
          path: file.name, // We don't need actual path anymore
          fullPath: file.name, // We don't need actual path anymore
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        alert(error.message || "An error occurred while processing the file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const updateTitleIfNeeded = async (content: string) => {
    // If this is the first message, update the conversation title
    if (messages.length === 0 && conversation) {
      // Create title from first ~5 words of the message or first 40 chars
      const words = content.split(/\s+/);
      const title = words.slice(0, 5).join(" ");
      const shortTitle =
        title.length > 40 ? title.substring(0, 40) + "..." : title;

      try {
        // Update conversation title in the database
        const result = await updateConversationTitle(
          conversationId,
          shortTitle,
        );

        if (result.success) {
          // Update local state
          setConversation((prev) =>
            prev ? { ...prev, title: shortTitle } : null,
          );

          // Dispatch a custom event for sidebar to listen to
          const updateEvent = new CustomEvent("conversation-title-updated", {
            detail: { id: conversationId, title: shortTitle },
          });

          window.dispatchEvent(updateEvent);
        }
      } catch (error) {
        console.error("Error updating title:", error);
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

    // Update conversation title if this is the first message
    await updateTitleIfNeeded(userContent);

    // Add user message locally first for immediate UI update
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userContent,
      ...(pendingFile && { fileAttachment: pendingFile.name }),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Save user message to database
    await addMessageToConversation(
      conversationId,
      "user",
      userContent,
      pendingFile?.fullPath,
    );

    setInput("");
    setIsLoading(true);

    try {
      // Create form data for server action
      const formData = new FormData();

      formData.append("question", userContent);
      formData.append("conversationId", conversationId);

      // Check if conversation has a file or a file is being uploaded now
      const hasFile =
        pendingFile || (conversation && conversation.hasAttachment);

      if (conversationId && hasFile) {
        console.log("Using file-chat with uploaded document for conversation");
        // Use /api/file-chat if conversationId exists and we have a file
        const response = await fetch("/api/file-chat", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        const responseText = result.error
          ? result.error
          : result.text || "No answer could be found.";

        // Add assistant message locally
        const assistantMessage: Message = {
          id: `temp-${Date.now()}-response`,
          role: "assistant",
          content: responseText,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message to database
        await addMessageToConversation(
          conversationId,
          "assistant",
          responseText,
        );

        // Clear pending file after sending
        setPendingFile(null);
      } else {
        // Regular RAG query (public/docs fallback)
        console.log("Using public documents as fallback");
        const result = await processAllDocsQuery(formData);
        const responseText =
          "error" in result
            ? result.error
            : result.text || "No answer could be found.";

        // Add assistant message locally
        const assistantMessage: Message = {
          id: `temp-${Date.now()}-response`,
          role: "assistant",
          content: responseText,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message to database
        // No conversationId, so skip DB save
      }
    } catch (error: any) {
      console.error("Error:", error);

      // Add error message locally
      const errorMessage: Message = {
        id: `temp-${Date.now()}-error`,
        role: "assistant",
        content: "Sorry, an error occurred. Please try again.",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      // Save error message to database
      await addMessageToConversation(
        conversationId,
        "assistant",
        "Sorry, an error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add a useEffect for textarea auto-resize on mount
  useEffect(() => {
    // Auto-resize textarea on initial render and when input changes
    if (textareaRef.current) {
      const adjustHeight = () => {
        const textarea = textareaRef.current;

        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
        }
      };

      adjustHeight();

      // Add event listener for window resize
      window.addEventListener("resize", adjustHeight);

      // Clean up event listener
      return () => window.removeEventListener("resize", adjustHeight);
    }
  }, [input]);

  if (isInitializing) {
    return <LoadingUI />;
  }

  if (error) {
    return <ErrorUI error={error} onBack={() => router.push("/chat")} />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-4">
        {messages.length === 0 && <WelcomeUI />}
        <MessageList isLoading={isLoading} messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
        <ChatInput
          fileInputRef={fileInputRef}
          handleSubmit={handleSubmit}
          input={input}
          isLoading={isLoading}
          isUploading={isUploading}
          pendingFile={pendingFile}
          removePendingFile={removePendingFile}
          setInput={setInput}
          textareaRef={textareaRef}
          onFileChange={handleFileChange}
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
}
