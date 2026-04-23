import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  PARSE_RESUME_TOOL,
  sanitizeResumeProfile,
  sanitizeQuestionPrefill,
} from "@/lib/salary";

export const runtime = "nodejs";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

const MAX_RESUME_TEXT_CHARS = 24000;

type ToolCallMessage = {
  tool_calls?: Array<{ function: { name: string; arguments: string } }>;
};

function getToolArguments(message: ToolCallMessage | undefined, name: string) {
  const toolCall = message?.tool_calls?.find((c) => c.function.name === name);
  if (!toolCall)
    throw new Error(`Mesh did not return the required ${name} tool call.`);
  try {
    return JSON.parse(toolCall.function.arguments) as unknown;
  } catch {
    throw new Error(`Mesh returned malformed JSON for ${name}.`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { resumeText?: unknown };
    const resumeText =
      typeof body?.resumeText === "string" ? body.resumeText.trim() : "";

    if (!resumeText) {
      return NextResponse.json(
        { error: "resumeText is required." },
        { status: 400 },
      );
    }

    const completion = await meshClient.chat.completions.create({
      model: "openai/gpt-4o",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You extract structured candidate profile data from resume text. Return only what is supported by the text and use sensible defaults for missing fields. Always call the parse_resume tool.",
        },
        { role: "user", content: resumeText.slice(0, MAX_RESUME_TEXT_CHARS) },
      ],
      tools: [PARSE_RESUME_TOOL],
      tool_choice: { type: "function", function: { name: "parse_resume" } },
    });

    const raw = getToolArguments(
      completion.choices[0]?.message as ToolCallMessage,
      "parse_resume",
    );
    const profile = sanitizeResumeProfile(raw);
    const prefill = sanitizeQuestionPrefill(raw);

    return NextResponse.json({ profile, prefill });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse resume.";
    const status = message.includes("resumeText is required")
      ? 400
      : message.includes("malformed JSON")
        ? 502
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
