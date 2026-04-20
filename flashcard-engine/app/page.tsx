"use client";

import { useState } from "react";
import { PdfDropzone } from "@/components/upload/PdfDropzone";
import { UploadSkeleton } from "@/components/upload/UploadSkeleton";
import { FlashcardDeck } from "@/components/study/FlashcardDeck";
import { useFlashcards } from "@/hooks/useFlashcards";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reusable dark-glass container for intermediate states */
function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { state, uploadFile, retryWithPageRange, retry, reset } =
    useFlashcards();

  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);

  if (
    state.status === "page_range" &&
    rangeEnd === 1 &&
    state.totalPages > 1
  ) {
    setRangeEnd(Math.min(state.totalPages, 20));
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── Page-level ambient gradient ──────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% -10%, oklch(0.55 0.22 265 / 0.07), transparent 55%)",
        }}
      />

      <div
        className={cn(
          "w-full",
          state.status === "studying"
            ? "max-w-2xl"
            : "max-w-xl space-y-8"
        )}
      >
        {/* ── Page header (hidden during study) ────────────── */}
        {state.status !== "studying" && (
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Flashcard Engine
            </h1>
            <p className="text-sm text-zinc-500">
              Upload a PDF and study with AI-generated flashcards
            </p>
          </div>
        )}

        {/* ── Idle — Vault dropzone ────────────────────────── */}
        {state.status === "idle" && (
          <PdfDropzone onFile={uploadFile} />
        )}

        {/* ── Extracting ───────────────────────────────────── */}
        {state.status === "extracting" && (
          <GlassPanel>
            <UploadSkeleton label="Extracting text from PDF…" />
          </GlassPanel>
        )}

        {/* ── Generating ───────────────────────────────────── */}
        {state.status === "generating" && (
          <GlassPanel>
            <UploadSkeleton label="Generating flashcards with AI…" />
          </GlassPanel>
        )}

        {/* ── Refining ─────────────────────────────────────── */}
        {state.status === "refining" && (
          <GlassPanel>
            <UploadSkeleton label="Refining and quality-checking cards…" />
          </GlassPanel>
        )}

        {/* ── Page-range picker ────────────────────────────── */}
        {state.status === "page_range" && (
          <GlassPanel className="space-y-6">
            <div className="text-center space-y-1">
              <p className="font-semibold text-zinc-100">
                Select a page range
              </p>
              <p className="text-xs text-zinc-500">
                This PDF has {state.totalPages} pages — pick a focused section
                to keep cards sharp.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              {(
                [
                  {
                    label: "Start page",
                    value: rangeStart,
                    min: 1,
                    max: state.totalPages,
                    onChange: (v: number) =>
                      setRangeStart(Math.max(1, v)),
                  },
                  {
                    label: "End page",
                    value: rangeEnd,
                    min: rangeStart,
                    max: state.totalPages,
                    onChange: (v: number) =>
                      setRangeEnd(Math.min(state.totalPages, v)),
                  },
                ] as const
              ).map(({ label, value, min, max, onChange }) => (
                <label
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-xs text-zinc-400"
                >
                  {label}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-20 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-center text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => retryWithPageRange(rangeStart, rangeEnd)}
                disabled={rangeStart > rangeEnd}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 265), oklch(0.50 0.22 285))",
                  boxShadow: "0 0 20px oklch(0.55 0.22 265 / 0.25)",
                }}
              >
                Generate Flashcards
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-semibold text-zinc-400 transition-all hover:border-white/20 hover:text-zinc-200 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </GlassPanel>
        )}

        {/* ── Error ────────────────────────────────────────── */}
        {state.status === "error" && (
          <GlassPanel className="flex flex-col items-center gap-5 border-red-500/15">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <p className="text-center text-sm font-medium text-red-400 max-w-sm">
              {state.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={retry}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 265), oklch(0.50 0.22 285))",
                }}
              >
                Try Again
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-semibold text-zinc-400 transition-all hover:border-white/20 hover:text-zinc-200 active:scale-95"
              >
                Upload Different PDF
              </button>
            </div>
          </GlassPanel>
        )}

        {/* ── Studying ─────────────────────────────────────── */}
        {state.status === "studying" && (
          <FlashcardDeck deck={state.deck} onBack={reset} />
        )}
      </div>
    </main>
  );
}
