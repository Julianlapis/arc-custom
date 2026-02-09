"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  light?: boolean;
}

export function CopyButton({ text, light }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baseClasses = light
    ? "text-neutral-500 hover:text-neutral-300"
    : "text-neutral-400 hover:text-neutral-600";

  return (
    <>
      <button
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className={`transition-colors ${
          copied ? "text-[var(--color-accent)]" : baseClasses
        }`}
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>
      <output aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </output>
    </>
  );
}
