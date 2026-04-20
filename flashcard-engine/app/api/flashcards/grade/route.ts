import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  GRADE_ANSWER_SYSTEM_PROMPT,
  FEYNMAN_GRADE_SYSTEM_PROMPT,
} from "@/lib/prompts";
import type { CardRating } from "@/lib/types";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

const GradeResultSchema = z.object({
  score: z.number().min(0).max(1).optional(),
  feedback: z.string().optional(),
  suggestedRating: z.enum(["correct", "easy", "hard", "incorrect"]).optional(),
  followUpQuestion: z.string().optional(),
  modelExplanation: z.string().optional(),
  done: z.boolean(),
});

const RequestSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  userAnswer: z.string().min(1),
  mode: z.enum(["type-answer", "feynman"]),
  conversationHistory: z
    .array(
      z.object({ role: z.enum(["user", "assistant"]), content: z.string() }),
    )
    .optional(),
  hintUsed: z.boolean().optional(),
});

function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : raw.trim();
  return JSON.parse(jsonStr);
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>;
  try {
    const raw = await req.json();
    const result = RequestSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { question, answer, userAnswer, mode, conversationHistory = [], hintUsed = false } = body;

  const systemPrompt =
    mode === "feynman" ? FEYNMAN_GRADE_SYSTEM_PROMPT : GRADE_ANSWER_SYSTEM_PROMPT;

  const roundCount = Math.floor(conversationHistory.length / 2);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Question: ${question}\nCorrect answer: ${answer}` },
    ...conversationHistory.map((t) => ({
      role: t.role as "user" | "assistant",
      content: t.content,
    })),
    {
      role: "user",
      content:
        mode === "feynman"
          ? `${roundCount >= 2 ? "[FINAL ROUND — set done: true and grade now] " : ""}My explanation: ${userAnswer}`
          : `My answer: ${userAnswer}`,
    },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const completion = await meshClient.chat.completions.create(
      {
        model: "anthropic/claude-sonnet-4-6",
        temperature: 0.1,
        messages,
      },
      { signal: controller.signal },
    );

    const content = completion.choices[0]?.message?.content ?? "";
    if (!content) {
      return NextResponse.json({ error: "Grading failed. Rate manually." }, { status: 422 });
    }

    let parsed: unknown;
    try {
      parsed = extractJson(content);
    } catch {
      return NextResponse.json({ error: "Grading failed. Rate manually." }, { status: 422 });
    }

    const gradeResult = GradeResultSchema.safeParse(parsed);
    if (!gradeResult.success) {
      return NextResponse.json({ error: "Grading failed. Rate manually." }, { status: 422 });
    }

    const { score, feedback, suggestedRating, followUpQuestion, modelExplanation, done } = gradeResult.data;

    if (!done && followUpQuestion) {
      return NextResponse.json({ done: false, followUp: followUpQuestion });
    }

    if (score === undefined || !feedback) {
      return NextResponse.json({ error: "Grading failed. Rate manually." }, { status: 422 });
    }

    const resolvedRating: CardRating =
      (suggestedRating as CardRating | undefined) ??
      (score >= 0.85 ? "correct" : score >= 0.6 ? "easy" : score >= 0.3 ? "hard" : "incorrect");

    return NextResponse.json({
      done: true,
      gradeResult: {
        score,
        feedback,
        suggestedRating: resolvedRating,
        hintUsed,
        ...(modelExplanation ? { modelExplanation } : {}),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Grading timed out. Rate manually." }, { status: 504 });
    }
    console.error("[flashcards/grade] Error:", err);
    return NextResponse.json({ error: "Grading failed. Rate manually." }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
