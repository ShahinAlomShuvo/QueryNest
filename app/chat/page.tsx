import { AutoChat } from "@/components/chat/AutoChat";

export const metadata = {
  title: "QueryNest - Chat",
  description: "Chat with your documents using AI",
};

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <AutoChat />
    </div>
  );
}
