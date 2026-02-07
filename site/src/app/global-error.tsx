"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-100 text-neutral-950 antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
          <div className="text-center">
            <p className="font-mono text-neutral-500 text-sm">Error</p>
            <h1 className="mt-2 font-bold font-mono text-4xl tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-4 text-neutral-600 text-sm">
              A critical error occurred.
            </p>
            <button
              className="mt-6 inline-block font-mono text-sm underline underline-offset-4 hover:opacity-70"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
