import Link from "next/link";
import { Button } from "@heroui/button";
import { Bot, ArrowRight, Search, FileText, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#f5f0ff] to-[#e2d5ff] dark:from-[#2a1e42] dark:to-[#1a1025] py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#4a1e9e] dark:text-[#bb86fc]">
                Smart Document Insights with AI
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300">
                QueryNest gives you instant answers from your documents. Upload
                PDFs or text files and get AI-powered insights in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register">
                  <Button
                    className="px-8 py-6 text-lg font-medium"
                    color="secondary"
                    size="lg"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button
                    className="px-8 py-6 text-lg font-medium"
                    size="lg"
                    variant="ghost"
                  >
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-[#8e24aa]/10 rounded-full filter blur-xl" />
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#4a1e9e]/10 rounded-full filter blur-xl" />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative">
                  <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#8e24aa] flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-medium text-xl">
                      QueryNest Assistant
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-800 dark:text-gray-200">
                        What are the key findings in the Q3 financial report?
                      </p>
                    </div>
                    <div className="bg-[#f3f0ff] dark:bg-[#331f52] rounded-lg p-3">
                      <p className="text-gray-800 dark:text-gray-200">
                        The Q3 financial report shows a 24% revenue increase,
                        with the new product line generating $2.7M. Operating
                        costs decreased by 8% due to the new automation system
                        implementation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#8e24aa]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Semantic Search</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ask questions in natural language and get accurate answers from
                your documents instantly.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#8e24aa]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Multiple File Types
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Support for PDFs, text files, and more. Extract information from
                any document type.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[#8e24aa]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your documents stay private. Advanced encryption and secure
                processing for your sensitive data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#f5f0ff] dark:bg-gray-800">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Extract Insights from Your Documents?
          </h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of professionals who use QueryNest to save time and
            make better decisions.
          </p>
          <Link href="/register">
            <Button
              className="px-8 py-6 text-lg font-medium"
              color="secondary"
              size="lg"
            >
              Start for Free
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
