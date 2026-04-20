"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardCard } from "./FlashcardCard";
import { ProgressBar } from "./ProgressBar";
import { CardGrid } from "./CardGrid";
import { useStudySession } from "@/hooks/useStudySession";
import { downloadAnkiCsv } from "@/lib/ankiExport";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Download,
  Grid3X3,
} from "lucide-react";
import type { CardRating, Deck, StudyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FlashcardDeckProps {
  deck: Deck;
  onBack: () => void;
}

function IconBtn({
  onClick,
  title,
  children,
  className,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03]",
        "text-zinc-400 transition-all duration-150",
        "hover:border-white/16 hover:bg-white/[0.07] hover:text-zinc-200",
        "active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

const MODE_OPTIONS: { value: StudyMode; label: string; description: string }[] = [
  { value: "classic", label: "Classic", description: "Flip cards, self-rate" },
  { value: "type-answer", label: "Type to Answer", description: "AI grades your answer" },
  { value: "feynman", label: "Feynman", description: "Explain it simply — AI pushes back" },
];

export function FlashcardDeck({ deck, onBack }: FlashcardDeckProps) {
  const [showCardGrid, setShowCardGrid] = useState(true);
  const {
    currentCard,
    currentProgress,
    currentIndex,
    reviewedCount,
    totalCount,
    isFinished,
    session,
    studyMode,
    isGrading,
    feynmanFollowUp,
    rateCard,
    submitAnswer,
    setStudyMode,
    goNext,
    goPrev,
    goTo,
    shuffle,
    restart,
  } = useStudySession(deck);

  const confettiFired = useRef(false);

  useEffect(() => {
    if (isFinished && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
    if (!isFinished) confettiFired.current = false;
  }, [isFinished]);

  // Keyboard controls — only in classic mode to avoid conflicting with textarea
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (studyMode !== "classic") return;
      switch (e.key) {
        case " ":
          e.preventDefault();
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
  }, [goNext, goPrev, rateCard, studyMode]);

  const correct = session.progress.filter(
    (p) => p.rating === "correct" || p.rating === "easy",
  ).length;
  const incorrect = session.progress.filter(
    (p) => p.rating === "incorrect" || p.rating === "hard",
  ).length;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Header bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h2 className="truncate text-sm font-semibold text-zinc-200 max-w-[160px] sm:max-w-xs">
          {deck.title}
        </h2>

        <div className="flex items-center gap-1.5">
          {!isFinished && (
            <IconBtn
              onClick={() => setShowCardGrid(!showCardGrid)}
              title="Toggle card overview"
              className={
                showCardGrid
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                  : ""
              }
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </IconBtn>
          )}
          <IconBtn onClick={shuffle} title="Shuffle & restart">
            <Shuffle className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={restart} title="Restart deck">
            <RotateCcw className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={() => downloadAnkiCsv(deck)} title="Export to Anki">
            <Download className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>

      {/* ── Study Mode Selector ──────────────────────────────────── */}
      {!isFinished && (
        <div className="flex rounded-xl border border-white/8 bg-white/[0.02] p-1 gap-1">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStudyMode(opt.value)}
              title={opt.description}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 text-center leading-tight",
                studyMode === opt.value
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <ProgressBar
        reviewed={reviewedCount}
        total={totalCount}
        correct={correct}
        incorrect={incorrect}
      />

      {/* ── Card Grid (toggle) ──────────────────────────────────── */}
      <AnimatePresence>
        {!isFinished && showCardGrid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardGrid
              deck={deck}
              progress={session.progress}
              currentIndex={currentIndex}
              onCardClick={goTo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Card / Finished ──────────────────────────────────────── */}
      {isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-8 py-14 text-center"
        >
          <span className="text-6xl select-none" aria-hidden>
            🎉
          </span>

          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-zinc-100">Deck Complete!</h3>
            <p className="text-sm text-zinc-500">
              You reviewed all {totalCount} cards
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-8 py-5">
              <span className="text-3xl font-bold text-emerald-400">
                {correct}
              </span>
              <span className="text-xs text-emerald-600 uppercase tracking-wider">
                Correct
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-red-500/20 bg-red-500/8 px-8 py-5">
              <span className="text-3xl font-bold text-red-400">
                {incorrect}
              </span>
              <span className="text-xs text-red-600 uppercase tracking-wider">
                To Review
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 265), oklch(0.50 0.22 285))",
                boxShadow: "0 0 24px oklch(0.55 0.22 265 / 0.3)",
              }}
            >
              <RotateCcw className="h-4 w-4" /> Study Again
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.06] active:scale-95"
            >
              Upload New PDF
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <p className="text-center text-xs text-zinc-600 tabular-nums">
            {currentIndex + 1} <span className="text-zinc-700">/</span>{" "}
            {totalCount}
          </p>

          {currentCard && (
            <FlashcardCard
              card={currentCard}
              onRate={(r: CardRating) => rateCard(r)}
              cardKey={currentCard.id}
              studyMode={studyMode}
              isGrading={isGrading}
              feynmanFollowUp={feynmanFollowUp}
              feynmanConversation={currentProgress?.feynmanConversation ?? []}
              gradeResult={currentProgress?.gradeResult ?? null}
              onSubmitAnswer={submitAnswer}
            />
          )}

          {/* Navigation — shown in all modes */}
          <div className="flex justify-center gap-3 pt-1">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-2 text-xs font-medium transition-all",
                currentIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "text-zinc-400 hover:border-white/16 hover:text-zinc-200 active:scale-95",
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === totalCount - 1}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-2 text-xs font-medium transition-all",
                currentIndex === totalCount - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "text-zinc-400 hover:border-white/16 hover:text-zinc-200 active:scale-95",
              )}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
