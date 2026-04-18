"use client";

import { useState } from "react";
import { PdfDropzone } from "@/components/upload/PdfDropzone";
import { UploadSkeleton } from "@/components/upload/UploadSkeleton";
import { FlashcardDeck } from "@/components/study/FlashcardDeck";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const { state, uploadFile, retryWithPageRange, retry, reset } =
    useFlashcards();

  // Page range picker state
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);

  // Sync default range end when we enter page_range state
  if (
    state.status === "page_range" &&
    rangeEnd === 1 &&
    state.totalPages > 1
  ) {
    setRangeEnd(Math.min(state.totalPages, 20));
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        {state.status !== "studying" && (
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Flashcard Engine
            </h1>
            <p className="mt-2 text-muted-foreground">
              Upload a PDF and study with AI-generated flashcards
            </p>
          </div>
        )}

        {/* Idle — Upload */}
        {state.status === "idle" && (
          <PdfDropzone onFile={uploadFile} />
        )}

        {/* Extracting text */}
        {state.status === "extracting" && (
          <Card>
            <CardContent className="pt-6">
              <UploadSkeleton label="Extracting text from PDF…" />
            </CardContent>
          </Card>
        )}

        {/* Generating cards */}
        {state.status === "generating" && (
          <Card>
            <CardContent className="pt-6">
              <UploadSkeleton label="Generating flashcards with AI…" />
            </CardContent>
          </Card>
        )}

        {/* Refining cards */}
        {state.status === "refining" && (
          <Card>
            <CardContent className="pt-6">
              <UploadSkeleton label="Refining and quality-checking cards…" />
            </CardContent>
          </Card>
        )}

        {/* Page range picker */}
        {state.status === "page_range" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-center font-medium">
                This PDF is large ({state.totalPages} pages). Select a page
                range to focus on:
              </p>
              <div className="flex items-center justify-center gap-4">
                <label className="flex flex-col items-center gap-1 text-sm">
                  Start page
                  <input
                    type="number"
                    min={1}
                    max={state.totalPages}
                    value={rangeStart}
                    onChange={(e) =>
                      setRangeStart(Math.max(1, Number(e.target.value)))
                    }
                    className="w-20 rounded border px-2 py-1 text-center"
                  />
                </label>
                <span className="mt-4 text-muted-foreground">–</span>
                <label className="flex flex-col items-center gap-1 text-sm">
                  End page
                  <input
                    type="number"
                    min={rangeStart}
                    max={state.totalPages}
                    value={rangeEnd}
                    onChange={(e) =>
                      setRangeEnd(
                        Math.min(state.totalPages, Number(e.target.value))
                      )
                    }
                    className="w-20 rounded border px-2 py-1 text-center"
                  />
                </label>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Total pages: {state.totalPages}
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => retryWithPageRange(rangeStart, rangeEnd)}
                  disabled={rangeStart > rangeEnd}
                >
                  Generate Flashcards
                </Button>
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {state.status === "error" && (
          <Card className="border-destructive">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-center font-medium text-destructive">
                {state.message}
              </p>
              <div className="flex gap-3">
                <Button onClick={retry} variant="default">
                  Try Again
                </Button>
                <Button onClick={reset} variant="outline">
                  Upload Different PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Studying */}
        {state.status === "studying" && (
          <FlashcardDeck deck={state.deck} onBack={reset} />
        )}
      </div>
    </main>
  );
}
