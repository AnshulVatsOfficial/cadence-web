"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none text-[#172B4D] leading-relaxed text-xs ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-[#172B4D] border-b border-[#DFE1E6] pb-2 mt-5 mb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-[#172B4D] mt-4 mb-2 border-b border-[#DFE1E6]/60 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-[#0052CC] mt-3.5 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-xs text-[#172B4D] leading-relaxed mb-2.5">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 text-xs text-[#172B4D] space-y-1 mb-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 text-xs text-[#172B4D] space-y-1 mb-3">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-xs text-[#172B4D] leading-relaxed">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#172B4D]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#5E6C84]">
              {children}
            </em>
          ),
          code: ({ children }) => (
            <code className="bg-[#F4F5F7] text-[#BF2600] px-1.5 py-0.5 rounded border border-[#DFE1E6] text-[11px] font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-[#091E42] text-white p-3 rounded-md overflow-x-auto text-xs font-mono my-3 shadow-inner">
              {children}
            </pre>
          ),
          hr: () => (
            <hr className="border-t border-[#DFE1E6] my-4" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#0052CC] pl-3 py-1.5 bg-[#DEEBFF]/40 text-[#0747A6] my-3 rounded-r text-xs">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
