"use client";

import { useEffect, useRef, useState } from "react";
import { apiPath } from "@/lib/basePath";

type Category = "movies" | "songs" | "books" | "tv-shows" | "mixed";

interface Round {
  id: string;
  emojis: string;
  category: Category;
  categoryLabel: string;
  maxTries: number;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "playing"; round: Round; strikes: number; hint?: string }
  | { kind: "won"; answer: string; strikes: number; category: string; emojis: string }
  | { kind: "lost"; answer: string; category: string; emojis: string }
  | { kind: "error"; message: string };

interface Score {
  correct: number;
  total: number;
}

const CATEGORIES: { key: Category; label: string; glyph: string }[] = [
  { key: "mixed",    label: "Surprise me", glyph: "🎲" },
  { key: "movies",   label: "Movies",      glyph: "🎬" },
  { key: "songs",    label: "Songs",       glyph: "🎵" },
  { key: "books",    label: "Books",       glyph: "📚" },
  { key: "tv-shows", label: "TV Shows",    glyph: "📺" },
];

export function EmojiGame() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [category, setCategory] = useState<Category>("mixed");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status.kind === "playing") inputRef.current?.focus();
  }, [status.kind, (status as { strikes?: number }).strikes]);

  async function startRound(chosen: Category = category) {
    setCategory(chosen);
    setGuess("");
    setStatus({ kind: "loading" });
    try {
      const res = await fetch(apiPath("/api/round"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: chosen }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Couldn't start a round (${res.status})`);
      }
      const round = (await res.json()) as Round;
      setStatus({ kind: "playing", round, strikes: 0 });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to start a round.",
      });
    }
  }

  async function submitGuess(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind !== "playing" || !guess.trim()) return;
    const s = status;
    setChecking(true);
    try {
      const res = await fetch(apiPath("/api/guess"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.round.id, guess: guess.trim() }),
      });
      const data = (await res.json()) as {
        correct: boolean;
        done?: boolean;
        strikes?: number;
        hint?: string;
        answer?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || `Couldn't check (${res.status})`);

      if (data.correct) {
        setScore((p) => ({ correct: p.correct + 1, total: p.total + 1 }));
        setStatus({
          kind: "won",
          answer: data.answer ?? "",
          strikes: data.strikes ?? 0,
          category: s.round.categoryLabel,
          emojis: s.round.emojis,
        });
      } else if (data.done) {
        setScore((p) => ({ correct: p.correct, total: p.total + 1 }));
        setStatus({
          kind: "lost",
          answer: data.answer ?? "",
          category: s.round.categoryLabel,
          emojis: s.round.emojis,
        });
      } else {
        setStatus({
          kind: "playing",
          round: s.round,
          strikes: data.strikes ?? s.strikes + 1,
          hint: data.hint,
        });
        setGuess("");
      }
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <ScoreRow score={score} onReset={() => setScore({ correct: 0, total: 0 })} />

      {status.kind === "idle" && (
        <CategoryPicker
          onPick={(c) => {
            startRound(c);
          }}
        />
      )}

      {status.kind === "loading" && <LoadingCard category={category} />}

      {status.kind === "playing" && (
        <PlayCard
          round={status.round}
          strikes={status.strikes}
          hint={status.hint}
          guess={guess}
          onGuessChange={setGuess}
          onSubmit={submitGuess}
          checking={checking}
          inputRef={inputRef}
          onGiveUp={() => {
            // Treat give-up as a loss without revealing (3 strikes bail-out)
            setScore((p) => ({ correct: p.correct, total: p.total + 1 }));
            setStatus({
              kind: "lost",
              answer: "(you gave up)",
              category: status.round.categoryLabel,
              emojis: status.round.emojis,
            });
          }}
        />
      )}

      {status.kind === "won" && (
        <ResultCard
          won
          answer={status.answer}
          strikes={status.strikes}
          emojis={status.emojis}
          category={status.category}
          onNext={() => startRound()}
        />
      )}

      {status.kind === "lost" && (
        <ResultCard
          answer={status.answer}
          emojis={status.emojis}
          category={status.category}
          onNext={() => startRound()}
        />
      )}

      {status.kind === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="mb-3 text-sm text-red-300">{status.message}</p>
          <button
            onClick={() => setStatus({ kind: "idle" })}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ score, onReset }: { score: Score; onReset: () => void }) {
  if (score.total === 0) return null;
  const pct = Math.round((score.correct / score.total) * 100);
  return (
    <div className="mb-6 flex items-center justify-between text-xs text-[color:var(--muted-fg)]">
      <span className="font-mono">
        {score.correct} / {score.total}  ·  {pct}%
      </span>
      <button
        onClick={onReset}
        className="text-[color:var(--muted-fg)] transition-colors hover:text-foreground"
      >
        Reset score
      </button>
    </div>
  );
}

function CategoryPicker({ onPick }: { onPick: (c: Category) => void }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-card p-8 sm:p-10">
      <p className="mb-2 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
        Step 1
      </p>
      <h2 className="mb-2 text-xl font-semibold tracking-tight">Pick a category</h2>
      <p className="mb-6 text-sm text-[color:var(--muted-fg)]">
        The AI will pick a well-known title in that category and represent it with 3–6
        emojis. You get 3 tries, with a hint after each wrong guess.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => onPick(c.key)}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-card-elevated px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary-soft"
          >
            <span className="text-lg">{c.glyph}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingCard({ category }: { category: Category }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-card p-10 text-center">
      <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-sm text-[color:var(--muted-fg)]">
        Cooking up a {category === "mixed" ? "random" : category} round…
      </p>
    </div>
  );
}

function PlayCard({
  round,
  strikes,
  hint,
  guess,
  onGuessChange,
  onSubmit,
  checking,
  inputRef,
  onGiveUp,
}: {
  round: Round;
  strikes: number;
  hint?: string;
  guess: string;
  onGuessChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  checking: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onGiveUp: () => void;
}) {
  const triesLeft = round.maxTries - strikes;
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-card p-8 sm:p-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          {round.categoryLabel}
        </span>
        <span className="font-mono text-[11px] text-[color:var(--muted-fg)]">
          {triesLeft} {triesLeft === 1 ? "try" : "tries"} left
        </span>
      </div>

      <div
        className="mb-8 select-none text-center text-[56px] leading-none tracking-[0.08em] sm:text-[72px]"
        style={{ fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}
        aria-label={`Emoji clue: ${round.emojis}`}
      >
        {round.emojis}
      </div>

      {hint && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm">
          <span className="font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
            Hint
          </span>
          <p className="mt-1 text-foreground">{hint}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          value={guess}
          onChange={(e) => onGuessChange(e.target.value)}
          placeholder="Type your guess and press Enter"
          className="w-full rounded-lg border border-[color:var(--border)] bg-card-elevated px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          autoComplete="off"
          autoFocus
          disabled={checking}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={checking || !guess.trim()}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? "Checking…" : "Guess"}
          </button>
          <button
            type="button"
            onClick={onGiveUp}
            className="rounded-full border border-[color:var(--border)] px-4 py-2.5 text-sm text-[color:var(--muted-fg)] transition-colors hover:text-foreground"
          >
            Give up
          </button>
        </div>
      </form>

      <div className="mt-5 flex justify-center gap-2">
        {Array.from({ length: round.maxTries }).map((_, i) => (
          <span
            key={i}
            className={`size-2 rounded-full transition-colors ${
              i < strikes ? "bg-red-400" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  won,
  answer,
  strikes,
  emojis,
  category,
  onNext,
}: {
  won?: boolean;
  answer: string;
  strikes?: number;
  emojis: string;
  category: string;
  onNext: () => void;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-card p-8 sm:p-10 text-center">
      <p className="mb-2 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
        {won ? "Nailed it" : "Better luck next round"}
      </p>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        {won ? "Correct!" : "Out of tries"}
      </h2>
      {won && typeof strikes === "number" && (
        <p className="mb-6 text-sm text-[color:var(--muted-fg)]">
          {strikes === 0 ? "First try. Flawless." : strikes === 1 ? "Got it on the second try." : "Third time lucky."}
        </p>
      )}

      <div
        className="mb-6 select-none text-center text-[56px] leading-none tracking-[0.08em] sm:text-[64px]"
        style={{ fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}
      >
        {emojis}
      </div>

      <p className="mb-1 text-xs text-[color:var(--muted-fg)] uppercase tracking-wider">
        {category}
      </p>
      <p className="mb-8 text-xl font-semibold">{answer}</p>

      <button
        onClick={onNext}
        className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Next round →
      </button>
    </div>
  );
}
