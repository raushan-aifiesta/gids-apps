"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-slate-500 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition"
      >
        Try again
      </button>
    </main>
  );
}
