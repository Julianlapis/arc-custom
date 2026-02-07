"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentContentProps {
  content: string;
}

export function DocumentContent({ content }: DocumentContentProps) {
  return (
    <div className="prose">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
