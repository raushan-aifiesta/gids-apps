import type { Flashcard } from "./types";

export interface GenerateFlashcardsResult {
  cards: Flashcard[];
}

export async function generateFlashcards(
  text: string,
  signal?: AbortSignal
): Promise<GenerateFlashcardsResult> {
  const res = await fetch("/api/flashcards/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error ?? `Server error ${res.status}. Please try again.`
    );
  }

  return data as GenerateFlashcardsResult;
}

/**
 * Send raw OCR text + generated cards to the refine endpoint.
 * Returns cleaned, deduplicated, higher-quality cards (same IDs).
 * On non-2xx, falls back gracefully — caller should use original cards.
 */
export async function refineFlashcards(
  ocrText: string,
  cards: Flashcard[],
  signal?: AbortSignal
): Promise<GenerateFlashcardsResult> {
  const res = await fetch("/api/flashcards/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ocrText, cards }),
    signal,
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface the server's error message but let the caller decide what to do
    throw new Error(
      data?.error ?? `Refinement server error ${res.status}.`
    );
  }

  return data as GenerateFlashcardsResult;
}
