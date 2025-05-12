/* eslint-disable no-console */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Bot, MessageSquare, Loader2 } from "lucide-react";

import { createConversation } from "@/lib/actions";

export default function ChatPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  // Create a new conversation and navigate to it
  const handleNewChat = async () => {
    try {
      setLoading(true);
      const result = await createConversation();

      if (result.success && result.conversationId) {
        router.push(`/chat/${result.conversationId}`);
      } else {
        console.error("Failed to create conversation:", result.error);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show login prompt
  if (status === "unauthenticated") {
    router.push("/login");
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {status === "loading" ? (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#8e24aa] flex items-center justify-center mb-6">
            <Bot className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-6">Welcome to QueryNest</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Get instant answers from your documents using AI. Upload files and
            ask questions to get started.
          </p>
          <Button
            className="px-8 py-6 rounded-xl text-lg flex items-center gap-2"
            color="secondary"
            disabled={loading}
            size="lg"
            onClick={handleNewChat}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5" />
                New Chat
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
