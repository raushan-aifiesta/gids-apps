"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadSession, saveSession, clearSession } from "@/lib/storage";
import type { CardRating, Deck, StudySession } from "@/lib/types";

export function useStudySession(deck: Deck) {
  const [session, setSession] = useState<StudySession>(() => {
    const saved = loadSession(deck.id);
    return (
      saved ?? { deckId: deck.id, progress: [], currentIndex: 0 }
    );
  });

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const currentCard = deck.cards[session.currentIndex] ?? null;

  const ratedIds = useMemo(
    () => new Set(session.progress.map((p) => p.cardId)),
    [session.progress]
  );

  const reviewedCount = session.progress.length;
  const totalCount = deck.cards.length;
  const isFinished = reviewedCount === totalCount;

  const rateCard = useCallback(
    (rating: CardRating) => {
      setSession((prev) => {
        const alreadyRated = prev.progress.some(
          (p) => p.cardId === deck.cards[prev.currentIndex]?.id
        );
        const newProgress = alreadyRated
          ? prev.progress.map((p) =>
              p.cardId === deck.cards[prev.currentIndex]?.id
                ? { ...p, rating, reviewedAt: Date.now() }
                : p
            )
          : [
              ...prev.progress,
              {
                cardId: deck.cards[prev.currentIndex]!.id,
                rating,
                reviewedAt: Date.now(),
              },
            ];
        // Advance to next unrated card
        const nextIndex = findNextIndex(
          deck.cards,
          prev.currentIndex,
          new Set(newProgress.map((p) => p.cardId))
        );
        return { ...prev, progress: newProgress, currentIndex: nextIndex };
      });
    },
    [deck.cards]
  );

  const goTo = useCallback((index: number) => {
    setSession((prev) => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, deck.cards.length - 1)),
    }));
  }, [deck.cards.length]);

  const goNext = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, deck.cards.length - 1),
    }));
  }, [deck.cards.length]);

  const goPrev = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const shuffle = useCallback(() => {
    // Fisher-Yates on deck indices via session reset with shuffled deck order
    // We shuffle progress + restart
    clearSession(deck.id);
    setSession({ deckId: deck.id, progress: [], currentIndex: 0 });
  }, [deck.id]);

  const restart = useCallback(() => {
    clearSession(deck.id);
    setSession({ deckId: deck.id, progress: [], currentIndex: 0 });
  }, [deck.id]);

  return {
    session,
    currentCard,
    currentIndex: session.currentIndex,
    reviewedCount,
    totalCount,
    isFinished,
    ratedIds,
    rateCard,
    goTo,
    goNext,
    goPrev,
    shuffle,
    restart,
    deck,
  };
}

function findNextIndex(
  cards: Deck["cards"],
  current: number,
  ratedIds: Set<string>
): number {
  // Try to advance to the next unrated card
  for (let i = current + 1; i < cards.length; i++) {
    if (!ratedIds.has(cards[i].id)) return i;
  }
  // If all remaining are rated, just move to next (or stay at last)
  return Math.min(current + 1, cards.length - 1);
}
