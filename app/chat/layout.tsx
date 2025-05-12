import { Sidebar } from "@/components/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Fixed sidebar, only visible on chat pages */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
} 