import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { mono } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://usearc.dev"),
  title: "Arc – The full arc from idea to shipped code",
  description:
    "A full development workflow for Claude Code. Commands and agents that handle ideation, design, planning, implementation, review, and deployment.",
  openGraph: {
    title: "Arc – The full arc from idea to shipped code",
    description:
      "A full development workflow for Claude Code. Commands and agents that handle ideation, design, planning, implementation, review, and deployment.",
    url: "https://usearc.dev",
    siteName: "Arc",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arc – The full arc from idea to shipped code",
    description:
      "A full development workflow for Claude Code. Commands and agents that handle ideation, design, planning, implementation, review, and deployment.",
    creator: "@howells",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${mono.variable} min-h-svh touch-manipulation`} lang="en">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="bg-neutral-100 text-neutral-950 antialiased isolate break-words">
        {children}
      </body>
    </html>
  );
}
