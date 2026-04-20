"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RatingButtons } from "./RatingButtons";
import { cn } from "@/lib/utils";
import type { CardRating, Flashcard } from "@/lib/types";

interface FlashcardCardProps {
  card: Flashcard;
  onRate: (rating: CardRating) => void;
  /** Changes when the card changes, resets flip state */
  cardKey: string;
}

const CARD_MIN_HEIGHT = 300;

export function FlashcardCard({ card, onRate, cardKey }: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);
  // "left" = swiping toward Hard, "right" = swiping toward Easy
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Reset flip + swipe indicator whenever the card changes
  useEffect(() => {
    setFlipped(false);
    setSwipeDir(null);
  }, [cardKey]);

  /* ── Touch swipe (after flip → rate) ─────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!flipped || touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      setSwipeDir(dx < 0 ? "left" : "right");
    } else {
      setSwipeDir(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setSwipeDir(null);
    if (!flipped || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    // Horizontal swipe threshold: 64px, must be more horizontal than vertical
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onRate(dx < 0 ? "hard" : "easy");
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* ── Card + stack ───────────────────────────────────────── */}
      <div
        className="relative w-full max-w-2xl"
        style={{ minHeight: CARD_MIN_HEIGHT }}
      >
        {/* Stack card 2 — bottom */}
        <div
          className="absolute inset-0 rounded-3xl border border-white/[0.04]"
          style={{
            background: "oklch(0.10 0 0)",
            transform: "translateY(12px) rotate(1.8deg) scale(0.975)",
          }}
        />
        {/* Stack card 1 */}
        <div
          className="absolute inset-0 rounded-3xl border border-white/[0.05]"
          style={{
            background: "oklch(0.115 0 0)",
            transform: "translateY(6px) rotate(-1.2deg) scale(0.988)",
          }}
        />

        {/* ── Main flipping card ─────────────────────────────── */}
        <div
          id="flashcard-click-target"
          className="relative cursor-pointer"
          style={{ perspective: "1400px", minHeight: CARD_MIN_HEIGHT }}
          onClick={() => setFlipped((f) => !f)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="relative w-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* ── Front face ── */}
            <div
              className="absolute inset-0 flex flex-col justify-center rounded-3xl border border-white/8 p-7 sm:p-10"
              style={{
                backfaceVisibility: "hidden",
                minHeight: CARD_MIN_HEIGHT,
                background: "oklch(0.13 0 0)",
              }}
            >
              {/* Type badge */}
              <span className="mb-5 inline-flex w-fit items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-400 tracking-wider uppercase">
                {card.type === "cloze" ? "Fill in the blank" : "Question"}
              </span>

              <p className="text-xl font-medium leading-relaxed text-zinc-100 sm:text-2xl">
                {card.question}
              </p>

              {card.hint && (
                <p className="mt-5 text-sm text-zinc-500 italic">
                  Hint: {card.hint}
                </p>
              )}

              <p className="mt-8 text-center text-xs text-zinc-600">
                Tap to reveal · <kbd>Space</kbd>
              </p>
            </div>

            {/* ── Back face ── */}
            <div
              className="absolute inset-0 flex flex-col justify-center rounded-3xl border border-indigo-500/20 p-7 sm:p-10 overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                minHeight: CARD_MIN_HEIGHT,
                background:
                  "linear-gradient(145deg, oklch(0.14 0.03 265), oklch(0.10 0 0) 70%)",
              }}
            >
              {/* Swipe direction overlay */}
              <AnimatePresence>
                {swipeDir && (
                  <motion.div
                    key={swipeDir}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      "pointer-events-none absolute inset-0 flex items-center rounded-3xl z-10",
                      swipeDir === "left"
                        ? "justify-start pl-8 bg-gradient-to-r from-orange-500/20 to-transparent"
                        : "justify-end pr-8 bg-gradient-to-l from-emerald-500/20 to-transparent"
                    )}
                  >
                    <span
                      className={cn(
                        "text-base font-bold tracking-widest",
                        swipeDir === "left"
                          ? "text-orange-400"
                          : "text-emerald-400"
                      )}
                    >
                      {swipeDir === "left" ? "← Hard" : "Easy →"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer badge */}
              <span className="mb-5 inline-flex w-fit items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 tracking-wider uppercase">
                Answer
              </span>

              <p className="text-xl font-medium leading-relaxed text-zinc-100 sm:text-2xl">
                {card.answer}
              </p>

              {/* Mobile swipe hint */}
              <p className="mt-8 text-center text-xs text-zinc-600 sm:hidden">
                ← Swipe Hard · Easy →
              </p>
            </div>
          </motion.div>

          {/* Height spacer */}
          <div style={{ minHeight: CARD_MIN_HEIGHT }} />
        </div>
      </div>

      {/* ── Rating buttons (desktop + visible-after-flip) ─────── */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <RatingButtons onRate={onRate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyboard hints ─────────────────────────────────────── */}
      <div className="text-xs text-zinc-600 flex flex-wrap justify-center gap-x-4 gap-y-1 select-none">
        {!flipped ? (
          <>
            <span>
              <kbd>Space</kbd> flip
            </span>
            <span>
              <kbd>←</kbd> <kbd>→</kbd> navigate
            </span>
          </>
        ) : (
          <>
            <span>
              <kbd>1</kbd> Incorrect
            </span>
            <span>
              <kbd>2</kbd> Hard
            </span>
            <span>
              <kbd>3</kbd> Easy
            </span>
            <span>
              <kbd>4</kbd> Correct
            </span>
          </>
        )}
      </div>
    </div>
  );
}
