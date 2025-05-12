"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bot, Plus, Menu, X } from "@/components/icons";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Dummy chat history for demonstration
  const chatHistory = [
    { id: "1", title: "Chat about React components", date: "2 days ago" },
    { id: "2", title: "TypeScript interfaces", date: "Yesterday" },
    { id: "3", title: "NextJS configuration", date: "Today" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8e24aa] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">QueryNest</h1>
          </div>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <Link
            className="w-full flex items-center justify-center gap-2 bg-[#8e24aa] hover:bg-[#7b1fa2] text-white px-4 py-2.5 rounded-md transition-colors"
            href="/chat"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Link>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <Link
                key={chat.id}
                className={`flex flex-col px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  pathname === `/chat/${chat.id}`
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }`}
                href={`/chat/${chat.id}`}
              >
                <span className="text-sm font-medium truncate">
                  {chat.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {chat.date}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
