import Link from "next/link";
import { Button } from "@heroui/button";
import { Bot } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] py-16 px-4">
      <div className="text-center max-w-3xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#8e24aa] flex items-center justify-center">
            <Bot className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6">QueryNest</h1>

        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Your AI-powered document assistant. Get instant answers from your
          documents.
        </p>

        <div className="space-y-4">
          <p className="mb-6">
            Just add your documents to the{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              /public/docs
            </code>{" "}
            folder, and QueryNest will automatically read and analyze them.
          </p>

          <Link href="/chat">
            <Button
              color="secondary"
              size="lg"
              className="px-8 py-6 rounded-xl text-lg"
            >
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
