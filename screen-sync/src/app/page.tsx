"use client";

import { useState } from "react";
import { Scan, Sparkles } from "lucide-react";
import { UploadForm } from "@/components/UploadForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { ScreeningResponse } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<ScreeningResponse | null>(null);

  return (
    <main className="min-h-screen bg-[#0a0f1e]">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-sky-600/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {/* Logo / Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/30">
            <Scan className="h-6 w-6 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Resume Screener
          </h1>
          <p className="mt-2 text-sm text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            AI-powered resume screening · Powered by Gemini 2.5 Flash
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm p-6 shadow-xl shadow-black/30">
          {results ? (
            <ResultsDashboard
              data={results}
              onReset={() => setResults(null)}
            />
          ) : (
            <UploadForm onComplete={setResults} />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Resumes are stored securely in the cloud for audit purposes.
        </p>
      </div>
    </main>
  );
}
