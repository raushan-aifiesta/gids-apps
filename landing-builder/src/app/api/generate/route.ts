import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/systemPrompt";
import { TONES, type ToneId } from "@/lib/aesthetics";

const mesh = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

// Extract a complete HTML document from model output, tolerating preambles,
// code fences, trailing commentary, and mid-stream truncation.
function extractHtml(raw: string): string | null {
  const s = raw.trim();
  // 1) Wrapped in ```html ... ``` — may also be truncated before closing fence
  const fence = s.match(/```(?:html)?\s*\n?([\s\S]*?)(?:\n?```|$)/i);
  if (fence && /<!doctype\s+html/i.test(fence[1])) {
    return salvage(fence[1].trim());
  }
  // 2) Unfenced — slice from the first <!DOCTYPE html>
  const startIdx = s.search(/<!doctype\s+html/i);
  if (startIdx === -1) return null;
  const sliced = s.slice(startIdx);
  const endMatch = sliced.match(/<\/html\s*>/i);
  if (endMatch && endMatch.index !== undefined) {
    const endIdx = endMatch.index + endMatch[0].length;
    return sliced.slice(0, endIdx).trim();
  }
  // Truncated — salvage whatever we have if there's a <body>
  return salvage(sliced);
}

// If the model stopped mid-document, close any open tags so the preview still
// renders. Only salvage if <body> was reached — otherwise we only have <head>
// and there's nothing meaningful to show.
function salvage(doc: string): string | null {
  const hasBodyOpen = /<body[\s>]/i.test(doc);
  if (!hasBodyOpen) return null;
  let out = doc.trimEnd();
  // If we're mid-tag (no closing >), drop the dangling fragment.
  const lastLt = out.lastIndexOf("<");
  const lastGt = out.lastIndexOf(">");
  if (lastLt > lastGt) out = out.slice(0, lastLt);
  if (!/<\/body\s*>/i.test(out)) out += "\n</body>";
  if (!/<\/html\s*>/i.test(out)) out += "\n</html>";
  return out.trim();
}

const VALID_TONES = new Set<string>(TONES.map((t) => t.id));

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      description?: string;
      productType?: string;
      tone?: string;
      productName?: string;
    };

    const description = (body.description ?? "").trim();
    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Please provide a description of at least 10 characters." },
        { status: 400 },
      );
    }
    if (description.length > 4000) {
      return NextResponse.json(
        { error: "Description too long. Please keep it under 4000 characters." },
        { status: 400 },
      );
    }

    const tone: ToneId | undefined =
      body.tone && VALID_TONES.has(body.tone) ? (body.tone as ToneId) : undefined;

    const userPrompt = buildUserPrompt({
      description,
      productType: body.productType?.trim() || undefined,
      tone,
      productName: body.productName?.trim() || undefined,
    });

    const MODEL = "openai/gpt-5.4";

    const stream = await mesh.chat.completions.create({
      model: MODEL,
      temperature: 0.8,
      max_tokens: 12000,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    let raw = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) raw += delta;
    }
    const html = extractHtml(raw);

    if (!html) {
      console.error("[/api/generate] non-HTML output preview:", raw.slice(0, 500));
      return NextResponse.json(
        {
          error:
            "Model output wasn't a valid HTML document. Try rephrasing the description or regenerate.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ html, model: MODEL, tone });
  } catch (err) {
    console.error("[/api/generate] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
