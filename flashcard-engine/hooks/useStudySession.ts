"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadSession, saveSession, clearSession } from "@/lib/storage";
import type {
  CardRating,
  CardGradeResult,
  CardProgress,
  Deck,
  FeynmanTurn,
  StudyMode,
  StudySession,
} from "@/lib/types";
import { apiPath } from "@/lib/basePath";

export function useStudySession(deck: Deck) {
  const [session, setSession] = useState<StudySession>(() => {
    const saved = loadSession(deck.id);
    return saved ?? { deckId: deck.id, progress: [], currentIndex: 0 };
  });

  // Study mode state — not persisted, resets per session start
  const [studyMode, setStudyMode] = useState<StudyMode>("classic");
  const [isGrading, setIsGrading] = useState(false);
  // Feynman follow-up question from AI
  const [feynmanFollowUp, setFeynmanFollowUp] = useState<string | null>(null);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const currentCard = deck.cards[session.currentIndex] ?? null;

  const ratedIds = useMemo(
    () => new Set(session.progress.map((p) => p.cardId)),
    [session.progress],
  );

  const reviewedCount = session.progress.length;
  const totalCount = deck.cards.length;
  const isFinished = reviewedCount === totalCount;

  const currentProgress = useMemo(
    () => session.progress.find((p) => p.cardId === currentCard?.id) ?? null,
    [session.progress, currentCard],
  );

  const rateCard = useCallback(
    (rating: CardRating) => {
      setSession((prev) => {
        const cardId = deck.cards[prev.currentIndex]?.id;
        if (!cardId) return prev;

        const alreadyRated = prev.progress.some((p) => p.cardId === cardId);
        const newProgress: CardProgress[] = alreadyRated
          ? prev.progress.map((p) =>
              p.cardId === cardId
                ? { ...p, rating, reviewedAt: Date.now() }
                : p,
            )
          : [...prev.progress, { cardId, rating, reviewedAt: Date.now() }];

        const nextIndex = findNextIndex(
          deck.cards,
          prev.currentIndex,
          new Set(newProgress.map((p) => p.cardId)),
        );
        return { ...prev, progress: newProgress, currentIndex: nextIndex };
      });
      setFeynmanFollowUp(null);
    },
    [deck.cards],
  );

  const submitAnswer = useCallback(
    async (userAnswer: string, hintUsed = false) => {
      const card = deck.cards[session.currentIndex];
      if (!card || studyMode === "classic") return;

      setIsGrading(true);

      const conversationHistory: FeynmanTurn[] =
        currentProgress?.feynmanConversation ?? [];

      try {
        const res = await fetch(apiPath("/api/flashcards/grade"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: card.question,
            answer: card.answer,
            userAnswer,
            mode: studyMode,
            conversationHistory,
            hintUsed,
          }),
        });

        if (!res.ok) {
          // Graceful fallback — user rates manually
          return;
        }

        const data = (await res.json()) as {
          done: boolean;
          followUp?: string;
          gradeResult?: CardGradeResult;
        };

        if (!data.done && data.followUp) {
          // Append user answer + AI follow-up to conversation history
          setSession((prev) => {
            const cardId = card.id;
            const existingIdx = prev.progress.findIndex(
              (p) => p.cardId === cardId,
            );
            const updatedTurns: FeynmanTurn[] = [
              ...(prev.progress[existingIdx]?.feynmanConversation ?? []),
              { role: "user", content: userAnswer },
              { role: "assistant", content: data.followUp! },
            ];

            const updatedProgress: CardProgress[] =
              existingIdx >= 0
                ? prev.progress.map((p, i) =>
                    i === existingIdx
                      ? { ...p, feynmanConversation: updatedTurns }
                      : p,
                  )
                : [
                    ...prev.progress,
                    {
                      cardId,
                      rating: "skipped",
                      reviewedAt: Date.now(),
                      feynmanConversation: updatedTurns,
                    },
                  ];

            return { ...prev, progress: updatedProgress };
          });
          setFeynmanFollowUp(data.followUp);
          return;
        }

        // Final grade received
        if (data.gradeResult) {
          setSession((prev) => {
            const cardId = card.id;
            const existingIdx = prev.progress.findIndex(
              (p) => p.cardId === cardId,
            );
            const updatedTurns: FeynmanTurn[] = [
              ...(prev.progress[existingIdx]?.feynmanConversation ?? []),
              { role: "user", content: userAnswer },
            ];

            const updatedProgress: CardProgress[] =
              existingIdx >= 0
                ? prev.progress.map((p, i) =>
                    i === existingIdx
                      ? {
                          ...p,
                          userAnswer,
                          gradeResult: data.gradeResult,
                          feynmanConversation:
                            studyMode === "feynman"
                              ? updatedTurns
                              : p.feynmanConversation,
                        }
                      : p,
                  )
                : [
                    ...prev.progress,
                    {
                      cardId,
                      rating: "skipped",
                      reviewedAt: Date.now(),
                      userAnswer,
                      gradeResult: data.gradeResult,
                      feynmanConversation:
                        studyMode === "feynman" ? updatedTurns : undefined,
                    },
                  ];

            return { ...prev, progress: updatedProgress };
          });
          setFeynmanFollowUp(null);
        }
      } catch {
        // Network error — silent fallback, user rates manually
      } finally {
        setIsGrading(false);
      }
    },
    [deck.cards, session.currentIndex, studyMode, currentProgress],
  );

  const changeStudyMode = useCallback(
    (mode: StudyMode) => {
      setStudyMode(mode);
      setFeynmanFollowUp(null);
      // Clear gradeResult for current card so input reappears
      setSession((prev) => {
        const cardId = deck.cards[prev.currentIndex]?.id;
        if (!cardId) return prev;
        return {
          ...prev,
          progress: prev.progress.map((p) =>
            p.cardId === cardId
              ? {
                  ...p,
                  gradeResult: undefined,
                  userAnswer: undefined,
                  feynmanConversation: undefined,
                }
              : p,
          ),
        };
      });
    },
    [deck.cards],
  );

  const goTo = useCallback(
    (index: number) => {
      setSession((prev) => {
        const next = Math.max(0, Math.min(index, deck.cards.length - 1));
        return { ...applyPendingRating(prev, deck.cards), currentIndex: next };
      });
      setFeynmanFollowUp(null);
    },
    [deck.cards],
  );

  const goNext = useCallback(() => {
    setSession((prev) => {
      const next = Math.min(prev.currentIndex + 1, deck.cards.length - 1);
      return { ...applyPendingRating(prev, deck.cards), currentIndex: next };
    });
    setFeynmanFollowUp(null);
  }, [deck.cards]);

  const goPrev = useCallback(() => {
    setSession((prev) => {
      const next = Math.max(prev.currentIndex - 1, 0);
      return { ...applyPendingRating(prev, deck.cards), currentIndex: next };
    });
    setFeynmanFollowUp(null);
  }, [deck.cards]);

  const shuffle = useCallback(() => {
    clearSession(deck.id);
    setSession({ deckId: deck.id, progress: [], currentIndex: 0 });
    setFeynmanFollowUp(null);
  }, [deck.id]);

  const restart = useCallback(() => {
    clearSession(deck.id);
    setSession({ deckId: deck.id, progress: [], currentIndex: 0 });
    setFeynmanFollowUp(null);
  }, [deck.id]);

  return {
    session,
    currentCard,
    currentIndex: session.currentIndex,
    reviewedCount,
    totalCount,
    isFinished,
    ratedIds,
    currentProgress,
    studyMode,
    isGrading,
    feynmanFollowUp,
    rateCard,
    submitAnswer,
    setStudyMode: changeStudyMode,
    goTo,
    goNext,
    goPrev,
    shuffle,
    restart,
    deck,
  };
}

function applyPendingRating(prev: StudySession, cards: Deck["cards"]): StudySession {
  const cardId = cards[prev.currentIndex]?.id;
  if (!cardId) return prev;
  const p = prev.progress.find((p) => p.cardId === cardId);
  if (!p?.gradeResult || p.rating !== "skipped") return prev;
  return {
    ...prev,
    progress: prev.progress.map((entry) =>
      entry.cardId === cardId
        ? { ...entry, rating: p.gradeResult!.suggestedRating, reviewedAt: Date.now() }
        : entry,
    ),
  };
}

function findNextIndex(
  cards: Deck["cards"],
  current: number,
  ratedIds: Set<string>,
): number {
  for (let i = current + 1; i < cards.length; i++) {
    if (!ratedIds.has(cards[i].id)) return i;
  }
  return Math.min(current + 1, cards.length - 1);
}
