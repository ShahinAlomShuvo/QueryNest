/* eslint-disable no-console */
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

export const createRagChain = async (documents: Document[]) => {
  try {
    // 1. Split documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(documents);

    // 2. Initialize Embedding Model
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "models/embedding-001",
    });

    // 3. Initialize PGVectorStore (PostgreSQL + pgvector)
    const vectorstore = await PGVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        postgresConnectionOptions: {
          connectionString: process.env.DATABASE_URL!,
        },
        tableName: "Document",
        columns: {
          idColumnName: "id",
          contentColumnName: "content",
          vectorColumnName: "vector",
        },
      },
    );

    // 4. Prompt template for the LLM
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
      - Format code blocks with proper syntax highlighting using triple backticks with the language name
      - Include tables using markdown table syntax when presenting structured data
      - Use > for quotations from the documents
      - Make your answer as informative and well-formatted as possible
    `);

    // 5. Initialize Gemini LLM
    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-pro",
      temperature: 0.2,
    });

    // 6. Document QA chain
    const documentChain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser(),
    });

    // 7. Retriever chain
    const retriever = vectorstore.asRetriever();
    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever,
    });

    return retrievalChain;
  } catch (error) {
    console.error("Error creating RAG chain:", error);
    throw error;
  }
};
