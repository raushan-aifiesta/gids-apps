"use client";

import type { CardRating } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RatingButtonsProps {
  onRate: (rating: CardRating) => void;
}

const RATINGS: {
  rating: CardRating;
  label: string;
  key: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}[] = [
  {
    rating: "incorrect",
    label: "Incorrect",
    key: "1",
    color: "text-red-400",
    bg: "hover:bg-red-500/10 active:bg-red-500/20",
    border: "border-red-500/20 hover:border-red-500/40",
    glow: "hover:shadow-[0_0_16px_oklch(0.65_0.19_22/0.25)]",
  },
  {
    rating: "hard",
    label: "Hard",
    key: "2",
    color: "text-orange-400",
    bg: "hover:bg-orange-500/10 active:bg-orange-500/20",
    border: "border-orange-500/20 hover:border-orange-500/40",
    glow: "hover:shadow-[0_0_16px_oklch(0.7_0.2_50/0.2)]",
  },
  {
    rating: "easy",
    label: "Easy",
    key: "3",
    color: "text-sky-400",
    bg: "hover:bg-sky-500/10 active:bg-sky-500/20",
    border: "border-sky-500/20 hover:border-sky-500/40",
    glow: "hover:shadow-[0_0_16px_oklch(0.6_0.2_220/0.2)]",
  },
  {
    rating: "correct",
    label: "Correct",
    key: "4",
    color: "text-emerald-400",
    bg: "hover:bg-emerald-500/10 active:bg-emerald-500/20",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    glow: "hover:shadow-[0_0_16px_oklch(0.65_0.19_160/0.25)]",
  },
];

export function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 w-full max-w-lg">
      {RATINGS.map(({ rating, label, key, color, bg, border, glow }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 sm:py-3.5",
            "transition-all duration-150 cursor-pointer select-none",
            "bg-white/[0.025]",
            bg,
            border,
            glow
          )}
        >
          <span className={cn("text-sm font-semibold tracking-wide", color)}>
            {label}
          </span>
          <kbd className="text-[0.6rem] opacity-50">{key}</kbd>
        </button>
      ))}
    </div>
  );
}
