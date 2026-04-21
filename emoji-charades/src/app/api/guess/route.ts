import { NextResponse } from "next/server";
import { deleteRound, getRound, updateRound } from "@/lib/rounds";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")        // punctuation → space
    .replace(/\b(the|a|an|and|of)\b/g, " ") // drop common stopwords
    .replace(/\s+/g, " ")
    .trim();
}

function isMatch(guess: string, answer: string): boolean {
  const g = normalize(guess);
  const a = normalize(answer);
  if (!g || !a) return false;
  if (g === a) return true;
  if (g.includes(a) || a.includes(g)) return true;

  // All significant tokens from the answer present in the guess?
  const answerTokens = a.split(" ").filter((t) => t.length >= 3);
  if (answerTokens.length === 0) return false;
  const guessTokens = new Set(g.split(" "));
  return answerTokens.every((t) => guessTokens.has(t));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string; guess?: string };
    if (!body.id || typeof body.guess !== "string") {
      return NextResponse.json({ error: "id and guess required" }, { status: 400 });
    }

    const round = getRound(body.id);
    if (!round) {
      return NextResponse.json({ error: "Round expired. Start a new one." }, { status: 404 });
    }

    const correct = isMatch(body.guess, round.answer);

    if (correct) {
      deleteRound(round.id);
      return NextResponse.json({
        correct: true,
        answer: round.answer,
        strikes: round.strikes,
      });
    }

    const nextStrikes = round.strikes + 1;
    updateRound(round.id, { strikes: nextStrikes });

    // Out of tries → reveal answer and clean up
    if (nextStrikes >= 3) {
      deleteRound(round.id);
      return NextResponse.json({
        correct: false,
        done: true,
        answer: round.answer,
        strikes: nextStrikes,
      });
    }

    // Otherwise return a hint — first strike → hint1, second → hint2
    const hint = round.hints[nextStrikes - 1];
    return NextResponse.json({
      correct: false,
      done: false,
      strikes: nextStrikes,
      hint,
    });
  } catch (err) {
    console.error("[/api/guess] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check guess" },
      { status: 500 },
    );
  }
}
