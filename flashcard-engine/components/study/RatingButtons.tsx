"use client";

import { Button } from "@/components/ui/button";
import type { CardRating } from "@/lib/types";

interface RatingButtonsProps {
  onRate: (rating: CardRating) => void;
}

export function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="outline"
        className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 min-w-[110px]"
        onClick={() => onRate("incorrect")}
      >
        <span className="mr-1 text-xs opacity-60">[1]</span> Incorrect
      </Button>
      <Button
        variant="outline"
        className="border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 min-w-[110px]"
        onClick={() => onRate("hard")}
      >
        <span className="mr-1 text-xs opacity-60">[2]</span> Hard
      </Button>
      <Button
        variant="outline"
        className="border-blue-400 text-blue-500 hover:bg-blue-50 hover:text-blue-600 min-w-[110px]"
        onClick={() => onRate("easy")}
      >
        <span className="mr-1 text-xs opacity-60">[3]</span> Easy
      </Button>
      <Button
        variant="outline"
        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 min-w-[110px]"
        onClick={() => onRate("correct")}
      >
        <span className="mr-1 text-xs opacity-60">[4]</span> Correct
      </Button>
    </div>
  );
}
