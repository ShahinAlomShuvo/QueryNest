/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Plus, Menu, X, Loader2, Trash, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";

import { showConfirm } from "@/components/ui/Toast";
import {
  getUserConversations,
  deleteConversation,
  createConversation,
} from "@/lib/actions";

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  // Load user conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        if (status === "authenticated") {
          setIsLoading(true);
          const result = await getUserConversations();

          if (result.success) {
            setConversations(
              result.conversations.map((c: any) => ({
                ...c,
                createdAt: new Date(c.createdAt),
                updatedAt: new Date(c.updatedAt),
              })),
            );
          }
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, [status, pathname]);

  // Listen for title update events
  useEffect(() => {
    // Handler for title update events
    const handleTitleUpdate = (event: CustomEvent) => {
      const { id, title } = event.detail;

      // Update the conversation title in our local state
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv,
        ),
      );
    };

    // Add event listener for custom title update events
    window.addEventListener(
      "conversation-title-updated",
      handleTitleUpdate as EventListener,
    );

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener(
        "conversation-title-updated",
        handleTitleUpdate as EventListener,
      );
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewChat = async () => {
    try {
      setCreateLoading(true);
      const result = await createConversation();

      if (result.success && result.conversationId) {
        router.push(`/chat/${result.conversationId}`);
        toggleSidebar(); // Close sidebar on mobile
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    showConfirm(
      "Are you sure you want to delete this conversation?",
      async () => {
        try {
          const result = await deleteConversation(id);

          if (result.success) {
            // Update local state
            setConversations((prev) => prev.filter((conv) => conv.id !== id));

            // If we're currently on this chat, navigate to the main chat page
            if (pathname === `/chat/${id}`) {
              router.push("/chat");
            }
          }
        } catch (error) {
          console.error("Error deleting conversation:", error);
        }
      },
    );
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        aria-label="Menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <button
          aria-label="Close sidebar"
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`h-screen lg:h-full fixed lg:sticky top-0 left-0 z-50 flex flex-col w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* New chat button - Fixed */}
        <div className="p-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          <button
            className="w-full flex items-center justify-center gap-2 bg-[#8e24aa] hover:bg-[#7b1fa2] text-white px-4 py-3 rounded-md transition-colors font-medium"
            disabled={createLoading || status !== "authenticated"}
            onClick={handleNewChat}
          >
            {createLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-4 pt-4 flex-shrink-0">
            Chat History
          </h3>

          <div className="px-4 pb-4">
            {status !== "authenticated" ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 px-2">
                Please log in to view your chat history
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
                <MessageSquare className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No conversations yet
                </p>
              </div>
            ) : (
              <nav className="space-y-1">
                {conversations.map((chat) => (
                  <div key={chat.id} className="group relative">
                    <Link
                      className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 mb-0.5 ${
                        pathname === `/chat/${chat.id}`
                          ? "bg-[#f0e6ff] dark:bg-[#36243b] text-[#8e24aa] dark:text-[#d183ff]"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                      href={`/chat/${chat.id}`}
                      onClick={() => {
                        if (isOpen) toggleSidebar(); // Close sidebar on mobile
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {chat.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(chat.updatedAt)}
                        </span>
                      </div>
                    </Link>
                    <button
                      aria-label={`Delete conversation: ${chat.title}`}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
                      type="button"
                      onClick={() => handleDeleteConversation(chat.id)}
                    >
                      <Trash className="w-4 h-4 text-gray-500 hover:text-red-500 dark:hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </nav>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
