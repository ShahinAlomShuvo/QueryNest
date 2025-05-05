"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={
        className ? `markdown-renderer ${className}` : "markdown-renderer"
      }
    >
      <ReactMarkdown
        components={{
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mt-6 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="text-xl font-bold mt-5 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-lg font-bold mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="my-2">
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc pl-6 my-3">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal pl-6 my-3">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="my-1">
              {children}
            </li>
          ),
          a: ({ children, ...props }) => (
            <a
              {...props}
              className="text-blue-600 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          code: ({ children, className, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && (className || "").includes("inline");

            return isInline ? (
              <code
                {...props}
                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto my-3"
              >
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className="bg-gray-100 dark:bg-gray-800 p-0 rounded-md overflow-x-auto my-3"
            >
              {children}
            </pre>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props} className="bg-gray-100 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody {...props} className="divide-y">
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr
              {...props}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th {...props} className="px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="px-3 py-2">
              {children}
            </td>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-3 py-1 my-3 italic"
            >
              {children}
            </blockquote>
          ),
          hr: ({ ...props }) => (
            <hr
              {...props}
              className="my-6 border-t border-gray-300 dark:border-gray-700"
            />
          ),
          img: ({ src, alt = "Image" }) => {
            if (!src) return null;

            return (
              <Image
                unoptimized
                alt={alt}
                className="max-w-full rounded my-3"
                height={300}
                src={src}
                style={{ width: "auto", height: "auto" }}
                width={500}
              />
            );
          },
        }}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
