"use client";

import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";
import type { CardProgress, Deck } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CardGridProps {
  deck: Deck;
  progress: CardProgress[];
  currentIndex: number;
  onCardClick: (index: number) => void;
}

export function CardGrid({
  deck,
  progress,
  currentIndex,
  onCardClick,
}: CardGridProps) {
  const progressMap = new Map(progress.map((p) => [p.cardId, p]));

  return (
    <div className="space-y-3 px-1">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>Card overview</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-sky-500/70" />
            <span>Easy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-orange-500/70" />
            <span>Hard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500/70" />
            <span>Incorrect</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
        {deck.cards.map((card, idx) => {
          const progress = progressMap.get(card.id);
          const isAnswered = !!progress;
          const isCurrent = idx === currentIndex;

          let bgColor = "bg-white/[0.025] border-white/8";
          let textColor = "text-zinc-500";
          let dotColor = "";

          if (!isAnswered) {
            bgColor = "bg-white/[0.025] border-white/8";
            textColor = "text-zinc-600";
            dotColor = "";
          } else if (progress.rating === "correct") {
            bgColor = "border-emerald-500/30 bg-emerald-500/10";
            textColor = "text-emerald-400";
            dotColor = "bg-emerald-500/70";
          } else if (progress.rating === "easy") {
            bgColor = "border-sky-500/30 bg-sky-500/10";
            textColor = "text-sky-400";
            dotColor = "bg-sky-500/70";
          } else if (progress.rating === "hard") {
            bgColor = "border-orange-500/30 bg-orange-500/10";
            textColor = "text-orange-400";
            dotColor = "bg-orange-500/70";
          } else if (progress.rating === "incorrect") {
            bgColor = "border-red-500/30 bg-red-500/10";
            textColor = "text-red-400";
            dotColor = "bg-red-500/70";
          }

          return (
            <motion.button
              key={card.id}
              onClick={() => onCardClick(idx)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-lg border py-2 transition-all duration-150",
                "hover:border-white/20 hover:bg-white/[0.06]",
                bgColor,
                isCurrent && "ring-2 ring-indigo-500/50"
              )}
            >
              <span className={cn("text-xs font-semibold", textColor)}>
                {idx + 1}
              </span>
              {isAnswered && dotColor && (
                <div className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
