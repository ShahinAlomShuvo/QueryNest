import { Metadata } from "next";

import { getConversation } from "@/lib/actions";
import { ConversationChat } from "@/components/chat/ConversationChat";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  params: {
    conversationId: Promise<string>;
  };
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const conversationId = await params.conversationId;
  const result = await getConversation(conversationId);
  const title =
    result.success && result.conversation
      ? `Chat: ${result.conversation.title}`
      : "Chat";

  return {
    title: `QueryNest - ${title}`,
  };
}

export default async function ConversationPage({ params }: ChatPageProps) {
  const conversationId = await params.conversationId;
  
  return (
    <div className="w-full h-[calc(100vh-0px)] p-0 m-0">
      <ConversationChat conversationId={conversationId} />
    </div>
  );
}
