import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { HINT_SYSTEM_PROMPT } from "@/lib/prompts";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

const RequestSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const completion = await meshClient.chat.completions.create(
      {
        model: "anthropic/claude-sonnet-4-6",
        temperature: 0.1,
        max_tokens: 30,
        messages: [
          { role: "system", content: HINT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Question: ${body.question}\nAnswer: ${body.answer}\n\nProvide one minimal hint:`,
          },
        ],
      },
      { signal: controller.signal }
    );

    const hint = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!hint) {
      return NextResponse.json({ error: "Could not generate hint" }, { status: 422 });
    }

    return NextResponse.json({ hint });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Hint request timed out" }, { status: 504 });
    }
    console.error("[flashcards/hint] Error:", err);
    return NextResponse.json({ error: "Could not generate hint" }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
