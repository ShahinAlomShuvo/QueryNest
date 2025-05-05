import { AutoChat } from "@/components/chat/AutoChat";

export const metadata = {
  title: "QueryNest - Chat",
  description: "Chat with your documents using AI",
};

export default function ChatPage() {
  return (
    <div className="w-full h-[calc(100vh-0px)] p-0 m-0">
      <AutoChat />
    </div>
  );
}
