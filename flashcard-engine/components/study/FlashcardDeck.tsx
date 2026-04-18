"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { FlashcardCard } from "./FlashcardCard";
import { ProgressBar } from "./ProgressBar";
import { useStudySession } from "@/hooks/useStudySession";
import { downloadAnkiCsv } from "@/lib/ankiExport";
import type { CardRating, Deck } from "@/lib/types";
import { RotateCcw, Shuffle, Download, ArrowLeft, ArrowRight } from "lucide-react";

interface FlashcardDeckProps {
  deck: Deck;
  onBack: () => void;
}

export function FlashcardDeck({ deck, onBack }: FlashcardDeckProps) {
  const {
    currentCard,
    currentIndex,
    reviewedCount,
    totalCount,
    isFinished,
    session,
    rateCard,
    goNext,
    goPrev,
    shuffle,
    restart,
  } = useStudySession(deck);

  const confettiFired = useRef(false);

  // Confetti when all cards are done
  useEffect(() => {
    if (isFinished && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
    if (!isFinished) {
      confettiFired.current = false;
    }
  }, [isFinished]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          // Flip is handled inside FlashcardCard via click, trigger click
          document.getElementById("flashcard-click-target")?.click();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "1":
          rateCard("incorrect");
          break;
        case "2":
          rateCard("hard");
          break;
        case "3":
          rateCard("easy");
          break;
        case "4":
          rateCard("correct");
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, rateCard]);

  const correct = session.progress.filter(
    (p) => p.rating === "correct" || p.rating === "easy"
  ).length;
  const incorrect = session.progress.filter(
    (p) => p.rating === "incorrect" || p.rating === "hard"
  ).length;

  const handleRate = (rating: CardRating) => {
    rateCard(rating);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h2 className="text-lg font-semibold truncate max-w-xs">{deck.title}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Shuffle & restart" onClick={shuffle}>
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Restart deck" onClick={restart}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Export to Anki"
            onClick={() => downloadAnkiCsv(deck)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        reviewed={reviewedCount}
        total={totalCount}
        correct={correct}
        incorrect={incorrect}
      />

      {/* Card or Finished state */}
      {isFinished ? (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <p className="text-4xl">🎉</p>
          <h3 className="text-2xl font-bold">Deck Complete!</h3>
          <p className="text-muted-foreground">
            {correct} correct · {incorrect} to review
          </p>
          <div className="flex gap-3">
            <Button onClick={restart} variant="default">
              <RotateCcw className="mr-2 h-4 w-4" /> Study Again
            </Button>
            <Button onClick={onBack} variant="outline">
              Upload New PDF
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Card counter */}
          <p className="text-center text-sm text-muted-foreground">
            Card {currentIndex + 1} of {totalCount}
          </p>

          {/* Card */}
          {currentCard && (
            <div id="flashcard-click-target">
              <FlashcardCard
                card={currentCard}
                onRate={handleRate}
                cardKey={currentCard.id}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-1 h-3 w-3" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={currentIndex === totalCount - 1}
            >
              Next <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
