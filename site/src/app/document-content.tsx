"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

interface DocumentContentProps {
  content: string;
}

export function DocumentContent({ content }: DocumentContentProps) {
  return (
    <div className="prose">
      <Markdown remarkPlugins={remarkPlugins}>{content}</Markdown>
    </div>
  );
}
