"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CardGradeResult, CardRating, FeynmanTurn, StudyMode } from "@/lib/types";
import { RatingButtons } from "./RatingButtons";
import { apiPath } from "@/lib/basePath";

interface TypeAnswerInputProps {
  mode: StudyMode;
  question: string;
  answer: string;
  onSubmit: (userAnswer: string, hintUsed: boolean) => void;
  isGrading: boolean;
  followUp: string | null;
  gradeResult: CardGradeResult | null;
  onRate: (rating: CardRating) => void;
  feynmanConversation?: FeynmanTurn[];
}

export function TypeAnswerInput({
  mode,
  question,
  answer,
  onSubmit,
  isGrading,
  followUp,
  gradeResult,
  onRate,
  feynmanConversation = [],
}: TypeAnswerInputProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFeynman = mode === "feynman";
  // Each round = one user+assistant pair; current round = pairs already completed
  const roundsCompleted = Math.floor(feynmanConversation.length / 2);
  const isInFollowUp = isFeynman && followUp !== null;

  useEffect(() => {
    if (gradeResult) return;
    nudgeTimerRef.current = setTimeout(() => setShowNudge(true), 10_000);
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [gradeResult]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUserAnswer(e.target.value);
      setShowNudge(false);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = setTimeout(() => setShowNudge(true), 10_000);
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim() || isGrading) return;
    onSubmit(userAnswer.trim(), hintUsed);
    setUserAnswer("");
  }, [userAnswer, isGrading, hintUsed, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const fetchHint = useCallback(async () => {
    setIsFetchingHint(true);
    try {
      const res = await fetch(apiPath("/api/flashcards/hint"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      if (res.ok) {
        const data = (await res.json()) as { hint: string };
        setHint(data.hint);
        setHintUsed(true);
        setShowNudge(false);
      }
    } catch {
      // silent
    } finally {
      setIsFetchingHint(false);
    }
  }, [question, answer]);

  // ── Grade result view ────────────────────────────────────────
  if (gradeResult) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Correct answer */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/8 p-4">
          <p className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5">
            Correct answer
          </p>
          <p className="text-base font-medium text-zinc-100 leading-relaxed">{answer}</p>
        </div>

        {/* Model explanation — only shown on Feynman round-limit failure */}
        {gradeResult.modelExplanation && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
            <p className="text-xs text-amber-400 uppercase tracking-wider mb-1.5">
              💡 Model explanation
            </p>
            <p className="text-sm text-amber-100/80 leading-relaxed">
              {gradeResult.modelExplanation}
            </p>
          </div>
        )}

        {/* Score bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/50">Accuracy</span>
            <span className="text-sm font-semibold text-white/80">
              {Math.round(gradeResult.score * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                gradeResult.score >= 0.85
                  ? "bg-emerald-400"
                  : gradeResult.score >= 0.6
                    ? "bg-sky-400"
                    : gradeResult.score >= 0.3
                      ? "bg-orange-400"
                      : "bg-red-400",
              )}
              style={{ width: `${gradeResult.score * 100}%` }}
            />
          </div>
        </div>

        {/* Feedback */}
        <p className="text-sm text-white/60 text-center leading-relaxed">
          {gradeResult.feedback}
        </p>
        {gradeResult.hintUsed && (
          <span className="text-xs text-white/30 italic text-center">Hint was used</span>
        )}

        <RatingButtons onRate={onRate} highlightedRating={gradeResult.suggestedRating} />
      </div>
    );
  }

  // ── Input view ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Feynman conversation thread */}
      {isFeynman && feynmanConversation.length > 0 && (
        <div className="flex flex-col gap-2">
          {feynmanConversation.map((turn, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm leading-relaxed",
                turn.role === "user"
                  ? "bg-white/[0.04] text-zinc-300 border border-white/8 ml-4"
                  : "bg-amber-500/8 text-amber-200/80 border border-amber-500/20 mr-4",
              )}
            >
              {turn.role === "assistant" && (
                <span className="text-xs text-amber-400 font-medium block mb-0.5">🤔 Follow-up</span>
              )}
              {turn.content}
            </div>
          ))}
        </div>
      )}

      {/* Round counter (Feynman follow-up rounds only) */}
      {isInFollowUp && (
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            roundsCompleted >= 1
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          )}>
            Round {roundsCompleted + 1} of 2{roundsCompleted >= 1 ? " — last chance" : ""}
          </span>
        </div>
      )}

      {/* Prompt label — only if no conversation yet */}
      {!isInFollowUp && (
        <p className="text-xs text-white/40">
          {isFeynman ? "Explain this as if to a 10-year-old. No jargon." : "Your answer"}
        </p>
      )}

      {/* Hint chip */}
      {hint && (
        <span className="inline-flex self-start items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          💡 {hint}
        </span>
      )}

      <textarea
        ref={textareaRef}
        value={userAnswer}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={
          isInFollowUp
            ? "Explain it more simply..."
            : isFeynman
              ? "Use everyday words, no technical terms..."
              : "Type your answer..."
        }
        rows={3}
        disabled={isGrading}
        className={cn(
          "w-full resize-none rounded-xl border border-white/10 bg-white/[0.04]",
          "px-4 py-3 text-sm text-white/90 placeholder:text-white/20",
          "focus:outline-none focus:border-white/20 focus:bg-white/[0.06]",
          "transition-all duration-150 disabled:opacity-50",
        )}
      />

      {/* Nudge */}
      {((showNudge && !hint && !isFetchingHint) || isFetchingHint) && (
        <div className="self-start">
          {isFetchingHint ? (
            <span className="text-xs text-white/30 animate-pulse">Getting hint…</span>
          ) : (
            <button
              onClick={fetchHint}
              className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Need a nudge?
            </button>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!userAnswer.trim() || isGrading}
        className={cn(
          "w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150",
          "bg-white/10 border border-white/10 text-white/80",
          "hover:bg-white/15 hover:border-white/20 hover:text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          isGrading && "animate-pulse",
        )}
      >
        {isGrading ? "Grading…" : isInFollowUp ? "Submit clarification" : "Submit"}
        {!isGrading && (
          <kbd className="ml-2 text-[0.6rem] opacity-40 hidden sm:inline">⌘↵</kbd>
        )}
      </button>
    </div>
  );
}
