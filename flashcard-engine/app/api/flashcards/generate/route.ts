import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { nanoid } from "nanoid";
import { FLASHCARD_SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts";
import { FlashcardsResponseSchema } from "@/lib/schemas";
import type { Flashcard } from "@/lib/types";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

function extractJson(raw: string): string {
  // Strip markdown code fences if the model wraps the JSON
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return raw.trim();
}

export async function POST(req: NextRequest) {
  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "Request body must include a non-empty 'text' field" },
      { status: 400 },
    );
  }

  if (text.length > 24000) {
    text = text.slice(0, 24000);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const completion = await meshClient.chat.completions.create(
      {
        model: "openai/gpt-4o",
        temperature: 0.2,
        messages: [
          { role: "system", content: FLASHCARD_SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(text) },
        ],
      },
      { signal: controller.signal },
    );

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonStr = extractJson(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed JSON. Please try again." },
        { status: 422 },
      );
    }

    const result = FlashcardsResponseSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "AI response did not match expected schema. Please try again.",
          details: result.error.flatten(),
        },
        { status: 422 },
      );
    }

    const cards: Flashcard[] = result.data.cards.map((c) => ({
      ...c,
      id: nanoid(),
    }));

    return NextResponse.json({ cards });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 },
      );
    }
    console.error("[flashcards/generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate flashcards. Please try again." },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
