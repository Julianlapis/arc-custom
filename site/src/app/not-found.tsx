import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-[calc(var(--baseline)*2)]">
      <div className="text-center">
        <p className="font-mono text-neutral-500 text-sm">404</p>
        <h1 className="mt-2 font-bold font-mono text-4xl tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-neutral-600 text-sm">
          The page you're looking for doesn't exist.
        </p>
        <Link
          className="mt-6 inline-block font-mono text-sm underline underline-offset-4 transition-colors hover:text-[var(--color-accent)]"
          href="/"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
