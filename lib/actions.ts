/* eslint-disable no-console */
"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { askWithRAG } from "./rag";
import { prisma } from "./prisma";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get list of available document files from local directory
// export async function getAvailablePdfs() {
//   const docsDir = join(process.cwd(), "public", "docs");

//   try {
//     // Read all files from docs directory
//     const files = readdirSync(docsDir);

//     // Filter only supported document files
//     const supportedFiles = files.filter(
//       (file) =>
//         file.toLowerCase().endsWith(".pdf") ||
//         file.toLowerCase().endsWith(".txt") ||
//         file.toLowerCase().endsWith(".docx") ||
//         file.toLowerCase().endsWith(".doc")
//     );

//     // Return serializable data
//     return supportedFiles.map((file) => ({
//       fileName: file,
//       filePath: join(docsDir, file),
//     }));
//   } catch (error) {
//     console.error("Error reading docs directory:", error);

//     return [];
//   }
// }

// Process RAG query against all documents
export async function processAllDocsQuery(formData: FormData) {
  const question = formData.get("question") as string;

  if (!question) {
    return {
      error: "Please enter a question",
    };
  }

  try {
    console.log("Processing query against public documents...");
    const result = await askWithRAG(question);

    // Return serializable result
    return {
      text: result.text,
      sources: Array.isArray(result.sourceDocs)
        ? result.sourceDocs.map((doc) => ({
            content:
              typeof doc.pageContent === "string"
                ? doc.pageContent
                : "Content not available",
            source: doc.metadata?.source || "Unknown source",
          }))
        : [],
    };
  } catch (error: any) {
    console.error("Error processing RAG query:", error);

    return {
      error: error.message || "There was a problem generating an answer",
    };
  }
}

// New server actions for conversation management

// Get user ID from session
async function getUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to perform this action");
  }

  return session.user.id;
}

// Create a new conversation
export async function createConversation(title?: string) {
  try {
    const userId = await getUserId();

    const conversation = await prisma.conversation.create({
      data: {
        title: title || "New Chat",
        userId,
      },
    });

    revalidatePath("/chat");

    return { success: true, conversationId: conversation.id };
  } catch (error: any) {
    console.error("Error creating conversation:", error);

    return { success: false, error: error.message };
  }
}

// Get a user's conversations for the sidebar
export async function getUserConversations() {
  try {
    const userId = await getUserId();

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, conversations };
  } catch (error: any) {
    console.error("Error fetching conversations:", error);

    return { success: false, error: error.message, conversations: [] };
  }
}

// Get a single conversation with messages
export async function getConversation(conversationId: string) {
  try {
    const userId = await getUserId();

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    if (conversation.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to view this conversation",
      };
    }

    return { success: true, conversation };
  } catch (error: any) {
    console.error("Error fetching conversation:", error);

    return { success: false, error: error.message };
  }
}

// Add a message to a conversation
export async function addMessageToConversation(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  fileAttachment?: string,
) {
  try {
    const userId = await getUserId();

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    if (conversation.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to modify this conversation",
      };
    }

    // Add the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        fileAttachment,
      },
    });

    // Update the conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/chat/${conversationId}`);

    return { success: true, messageId: message.id };
  } catch (error: any) {
    console.error("Error adding message:", error);

    return { success: false, error: error.message };
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
  try {
    const userId = await getUserId();

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    if (conversation.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to delete this conversation",
      };
    }

    // Delete the conversation (messages will cascade delete)
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    revalidatePath("/chat");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting conversation:", error);

    return { success: false, error: error.message };
  }
}

// Update conversation title
export async function updateConversationTitle(
  conversationId: string,
  title: string,
) {
  try {
    const userId = await getUserId();

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    if (conversation.userId !== userId) {
      return {
        success: false,
        error: "You don't have permission to modify this conversation",
      };
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });

    revalidatePath("/chat");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating conversation title:", error);

    return { success: false, error: error.message };
  }
}

export async function updateConversationFile(
  conversationId: string
) {
  try {
    if (!conversationId) {
      return { error: "Conversation ID is required" };
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { hasAttachment: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating conversation file:", error);
    return { error: error.message || "Failed to update conversation file" };
  }
}
