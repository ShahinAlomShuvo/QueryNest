import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const question = formData.get("question") as string;
    const conversationId = formData.get("conversationId") as string;

    if (!question) {
      return NextResponse.json(
        { error: "Please provide a question" },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "No conversation ID provided" },
        { status: 400 }
      );
    }

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "models/embedding-001",
    });

    // Initialize vector store
    const vectorStore = await PGVectorStore.initialize(embeddings, {
      postgresConnectionOptions: {
        connectionString: process.env.DATABASE_URL!,
      },
      tableName: "Document",
      columns: {
        idColumnName: "id",
        contentColumnName: "content",
        vectorColumnName: "embedding",
      },
      filter: {
        whereClause: "metadata->>'conversationId' = $1",
        whereParams: [conversationId],
      },
    });

    // Initialize chat model
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-pro",
      temperature: 0.2,
    });

    // Create prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
      Answer the question based only on the following context:
      <context>
      {context}
      </context>

      Question: {input}
      
      If the answer is not in the context, just say "I don't have information about that in the provided documents."
      
      Format your answer using markdown:
      - Use **bold** for emphasis
      - Create proper headings with # where appropriate
      - Use bullet points or numbered lists when listing items
      - Format code blocks with proper syntax highlighting
      - Include tables using markdown table syntax when presenting structured data
      - Use > for quotations from the documents
    `);

    // Create document chain
    const documentChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
      outputParser: new StringOutputParser(),
    });

    // Create retrieval chain
    const retriever = vectorStore.asRetriever();
    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever,
    });

    // Get response
    const result = await retrievalChain.invoke({
      input: question,
    });

    return NextResponse.json({
      text: result.answer,
      sources: result.context.map((doc: any) => ({
        content: doc.pageContent,
        source: doc.metadata?.fileName || "Unknown source",
      })),
    });
  } catch (error: any) {
    console.error("Error processing file chat query:", error);
    return NextResponse.json(
      { error: error.message || "Error processing your request" },
      { status: 500 }
    );
  }
}
