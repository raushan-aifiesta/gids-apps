import { NextResponse } from "next/server";
import OpenAI from "openai";
import { nanoid } from "nanoid";
import { saveRound, type Category } from "@/lib/rounds";

const mesh = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

const CATEGORIES: Record<Category, string> = {
  movies: "a famous movie",
  songs: "a famous song",
  books: "a famous book",
  "tv-shows": "a famous TV show",
  mixed: "a famous movie, song, book, or TV show",
};

const CATEGORY_LABEL: Record<Category, string> = {
  movies: "Movie",
  songs: "Song",
  books: "Book",
  "tv-shows": "TV Show",
  mixed: "Movie / Song / Book / TV Show",
};

const PAYLOAD_TOOL = {
  type: "function" as const,
  function: {
    name: "emit_round",
    description: "Emit an emoji-charade round with answer, emojis, and two hints.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["answer", "answer_type", "emojis", "hint1", "hint2"],
      properties: {
        answer: {
          type: "string",
          description:
            "The title of the chosen work. Use the most common English title. No extra commentary.",
        },
        answer_type: {
          type: "string",
          enum: ["movie", "song", "book", "tv-show"],
          description: "What kind of work this is.",
        },
        emojis: {
          type: "string",
          description:
            "3 to 6 emoji characters that represent the title. Emojis only — no text, no punctuation, no spaces.",
        },
        hint1: {
          type: "string",
          description:
            "A first hint that narrows the answer without naming it. No quotes, no proper nouns from the title.",
        },
        hint2: {
          type: "string",
          description:
            "A second, more specific hint. Still does not include the title itself.",
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are the host of an emoji-charades game. You pick a well-known work (very famous — something most people would recognise) and describe it with 3–6 emojis only. The player guesses.

Rules:
- Emojis MUST be 3 to 6 characters, nothing but emojis (no letters, no spaces, no numbers). Examples: "🎬🦁👑", "🔴🟢🎲".
- The "answer" is the most common English title. Omit articles if that's how people usually refer to it.
- Hints must NOT include the title, main character names, or any word from the title. Use indirect clues (era, genre, theme, famous line paraphrase, related work).
- Avoid extremely obscure picks. Aim for "heard of by 70%+ of adults".
- If the category says "mixed", pick from movies/songs/books/TV — surprise the player.

Always respond by calling the emit_round tool.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { category?: Category };
    const category: Category =
      body.category && ["movies", "songs", "books", "tv-shows", "mixed"].includes(body.category)
        ? body.category
        : "mixed";

    const userPrompt = `Pick ${CATEGORIES[category]} and emit a round for me.`;

    const completion = await mesh.chat.completions.create({
      model: "openai/gpt-4o",
      temperature: 0.9,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      tools: [PAYLOAD_TOOL],
      tool_choice: { type: "function", function: { name: "emit_round" } },
    });

    const toolCall = completion.choices[0]?.message?.tool_calls?.find(
      (c): c is typeof c & { type: "function"; function: { name: string; arguments: string } } =>
        c.type === "function" && c.function.name === "emit_round",
    );
    if (!toolCall) {
      return NextResponse.json({ error: "Model did not emit a round" }, { status: 502 });
    }

    const parsed = JSON.parse(toolCall.function.arguments) as {
      answer: string;
      answer_type: "movie" | "song" | "book" | "tv-show";
      emojis: string;
      hint1: string;
      hint2: string;
    };

    const id = nanoid(12);
    const round = {
      id,
      answer: parsed.answer.trim(),
      category,
      categoryLabel: CATEGORY_LABEL[category],
      emojis: parsed.emojis.trim(),
      hints: [parsed.hint1.trim(), parsed.hint2.trim()],
      strikes: 0,
      createdAt: Date.now(),
    };
    saveRound(round);

    // Expose only what the client needs
    return NextResponse.json({
      id: round.id,
      emojis: round.emojis,
      category: round.category,
      categoryLabel: round.categoryLabel,
      answerType: parsed.answer_type,
      maxTries: 3,
    });
  } catch (err) {
    console.error("[/api/round] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create round" },
      { status: 500 },
    );
  }
}
