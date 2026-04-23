import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  REFINE_SYSTEM_PROMPT,
  buildRefineUserMessage,
} from "@/lib/refinePrompt";
import { FlashcardsResponseSchema } from "@/lib/schemas";
import type { Flashcard } from "@/lib/types";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return raw.trim();
}

export async function POST(req: NextRequest) {
  let ocrText: string;
  let cards: Flashcard[];

  try {
    const body = await req.json();
    ocrText = typeof body?.ocrText === "string" ? body.ocrText.trim() : "";
    cards = Array.isArray(body?.cards) ? body.cards : [];
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!ocrText) {
    return NextResponse.json(
      { error: "Request body must include a non-empty 'ocrText' field" },
      { status: 400 },
    );
  }

  if (cards.length === 0) {
    return NextResponse.json(
      { error: "Request body must include a non-empty 'cards' array" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const completion = await meshClient.chat.completions.create(
      {
        model: "openai/gpt-4o",
        temperature: 0.1, // low temp — deterministic refinement
        messages: [
          { role: "system", content: REFINE_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildRefineUserMessage({ ocrText, cards }),
          },
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
        {
          error:
            "AI returned malformed JSON during refinement. Original cards preserved.",
        },
        { status: 422 },
      );
    }

    const result = FlashcardsResponseSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Refined response did not match expected schema.",
          details: result.error.flatten(),
        },
        { status: 422 },
      );
    }

    // Assign IDs from refined cards — the model should keep them, but
    // fall back to original IDs positionally if the model dropped them.
    const refinedCards: Flashcard[] = result.data.cards.map((c, i) => ({
      ...c,
      id: c.id ?? cards[i]?.id ?? crypto.randomUUID(),
    }));

    return NextResponse.json({ cards: refinedCards });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Refinement timed out. Original cards preserved." },
        { status: 504 },
      );
    }
    console.error("[flashcards/refine] Error:", err);
    return NextResponse.json(
      { error: "Refinement failed. Original cards preserved." },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
