"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  Bot,
  Plus,
  LayoutGrid,
  Settings,
  User,
  Menu,
  X,
  FileText,
} from "@/components/icons";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        aria-label="Menu"
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
            href="/chat"
            className="w-full flex items-center justify-center gap-2 bg-[#8e24aa] hover:bg-[#7b1fa2] text-white px-4 py-2.5 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
              pathname === "/"
                ? "bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
              pathname === "/chat"
                ? "bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Bot className="w-5 h-5" />
            <span>Chat</span>
          </Link>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span>User</span>
            </div>
            <ThemeSwitch />
          </div>
        </div>
      </aside>
    </>
  );
}
