"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RatingButtons } from "./RatingButtons";
import type { CardRating, Flashcard } from "@/lib/types";

interface FlashcardCardProps {
  card: Flashcard;
  onRate: (rating: CardRating) => void;
  cardKey: string; // changes when card changes to reset flip state
}

export function FlashcardCard({ card, onRate, cardKey }: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setFlipped(false);
  }, [cardKey]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        className="relative w-full max-w-2xl cursor-pointer"
        style={{ perspective: "1200px", minHeight: 260 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col justify-center rounded-2xl border bg-card p-8 shadow-md"
            style={{ backfaceVisibility: "hidden", minHeight: 260 }}
          >
            <Badge variant="secondary" className="mb-4 w-fit">
              {card.type === "cloze" ? "Fill in the blank" : "Question"}
            </Badge>
            <p className="text-xl font-medium leading-relaxed text-card-foreground">
              {card.question}
            </p>
            {card.hint && (
              <p className="mt-4 text-sm text-muted-foreground italic">
                Hint: {card.hint}
              </p>
            )}
            <p className="mt-6 text-xs text-muted-foreground text-center">
              Click to reveal answer · Space
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col justify-center rounded-2xl border bg-primary/5 p-8 shadow-md"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              minHeight: 260,
            }}
          >
            <Badge className="mb-4 w-fit">Answer</Badge>
            <p className="text-xl font-medium leading-relaxed text-card-foreground">
              {card.answer}
            </p>
          </div>
        </motion.div>

        {/* Spacer to give the card height */}
        <div style={{ minHeight: 260 }} />
      </div>

      {/* Rating buttons — only shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <RatingButtons onRate={onRate} />
          </motion.div>
        )}
      </AnimatePresence>

      {!flipped && (
        <p className="text-sm text-muted-foreground">
          Keyboard: <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">Space</kbd> to flip ·{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">←</kbd>{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">→</kbd> navigate
        </p>
      )}
      {flipped && (
        <p className="text-sm text-muted-foreground">
          Rate: <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">1</kbd> Incorrect ·{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">2</kbd> Hard ·{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">3</kbd> Easy ·{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono">4</kbd> Correct
        </p>
      )}
    </div>
  );
}
