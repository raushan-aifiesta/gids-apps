"use client";

import { useCallback, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { extractTextFromPdf } from "@/lib/pdfText";
import { generateFlashcards, refineFlashcards } from "@/lib/api";
import { saveDeck } from "@/lib/storage";
import type { AppState, Deck, Flashcard } from "@/lib/types";

export function useFlashcards() {
  const [state, setState] = useState<AppState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<File | null>(null);

  const processFile = useCallback(
    async (file: File, pageRange?: { start: number; end: number }) => {
      fileRef.current = file;
      setState({ status: "extracting" });

      // ── 1. Extract text (pdfjs → Tesseract.js OCR fallback) ───────────────
      let text: string;
      let totalPages: number;

      try {
        const result = await extractTextFromPdf(file, pageRange);
        text = result.text;
        totalPages = result.totalPages;

        // Large PDF with no targeted range yet → ask user to pick pages
        if (result.truncated && !pageRange) {
          setState({
            status: "page_range",
            totalChars: result.text.length,
            totalPages,
          });
          return;
        }
      } catch (err: unknown) {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Failed to extract PDF text.",
        });
        return;
      }

      // ── 2. Generate raw flashcards ─────────────────────────────────────────
      setState({ status: "generating" });
      abortRef.current = new AbortController();

      let rawCards: Flashcard[];
      try {
        const { cards } = await generateFlashcards(
          text,
          abortRef.current.signal
        );

        if (cards.length === 0) {
          setState({
            status: "error",
            message:
              "No flashcards could be generated. Try a different PDF or page range.",
          });
          return;
        }

        rawCards = cards;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Failed to generate flashcards.",
        });
        return;
      }

      // ── 3. Refine cards (OCR cleanup + quality upgrade) ───────────────────
      setState({ status: "refining" });

      let finalCards: Flashcard[] = rawCards;
      try {
        const { cards: refined } = await refineFlashcards(
          text,
          rawCards,
          abortRef.current.signal
        );
        if (refined.length > 0) finalCards = refined;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Refinement is best-effort — fall back to raw cards silently
        console.warn(
          "[useFlashcards] Refinement failed, using raw cards:",
          err instanceof Error ? err.message : err
        );
      }

      // ── 4. Build deck and persist ─────────────────────────────────────────
      const deck: Deck = {
        id: nanoid(),
        title: file.name.replace(/\.pdf$/i, ""),
        cards: finalCards,
        createdAt: Date.now(),
      };

      saveDeck(deck);
      setState({ status: "studying", deck });
    },
    []
  );

  const uploadFile = useCallback(
    (file: File) => processFile(file),
    [processFile]
  );

  const retryWithPageRange = useCallback(
    (start: number, end: number) => {
      if (fileRef.current) processFile(fileRef.current, { start, end });
    },
    [processFile]
  );

  const retry = useCallback(() => {
    if (fileRef.current) processFile(fileRef.current);
    else setState({ status: "idle" });
  }, [processFile]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    fileRef.current = null;
    setState({ status: "idle" });
  }, []);

  return { state, uploadFile, retryWithPageRange, retry, reset };
}
