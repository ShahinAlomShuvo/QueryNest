import { Metadata } from "next";

import { getConversation } from "@/lib/actions";
import { ConversationChat } from "@/components/chat/ConversationChat";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const { conversationId } = await params;
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
  const { conversationId } = await params;

  return (
    <div className="h-full w-full">
      <ConversationChat conversationId={conversationId} />
    </div>
  );
}
