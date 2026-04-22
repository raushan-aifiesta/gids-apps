import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  PARSE_RESUME_TOOL,
  PREDICT_SALARY_TOOL,
  EXPLAIN_SALARY_TOOL,
  SALARY_PREDICTION_SYSTEM_PROMPT,
  EXPLAIN_SALARY_SYSTEM_PROMPT,
  sanitizeResumeProfile,
  sanitizeSalaryPrediction,
  sanitizeExplanation,
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

function getForcedToolArguments(message: ToolCallMessage | undefined, name: string) {
  if (!message) {
    throw new Error(`Mesh did not return a completion message for ${name}.`);
  }

  const toolCall = message.tool_calls?.find((call) => call.function.name === name);
  if (!toolCall) {
    throw new Error(`Mesh did not return the required ${name} tool call.`);
  }

  try {
    return JSON.parse(toolCall.function.arguments) as unknown;
  } catch {
    throw new Error(`Mesh returned malformed JSON for ${name}.`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { resumeText?: unknown; profile?: unknown; userContext?: unknown };
    const resumeText =
      typeof body?.resumeText === "string" ? body.resumeText.trim() : "";

    if (!resumeText) {
      return NextResponse.json(
        { error: "resumeText is required." },
        { status: 400 }
      );
    }

    const limitedText = resumeText.slice(0, MAX_RESUME_TEXT_CHARS);

    // ── Step 1: Parse resume (skip if profile already provided by client) ─────
    let profile;
    if (body.profile) {
      try {
        profile = sanitizeResumeProfile(body.profile);
      } catch {
        profile = null;
      }
    }

    if (!profile) {
      const parseCompletion = await meshClient.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You extract structured candidate profile data from resume text. Return only what is supported by the text and use sensible defaults for missing fields. Always call the parse_resume tool.",
          },
          { role: "user", content: limitedText },
        ],
        tools: [PARSE_RESUME_TOOL],
        tool_choice: { type: "function", function: { name: "parse_resume" } },
      });

      profile = sanitizeResumeProfile(
        getForcedToolArguments(parseCompletion.choices[0]?.message as ToolCallMessage, "parse_resume")
      );
    }

    const userContext = body.userContext ?? null;

    // ── Step 2: Predict salary (Bedrock Claude, fallback to GPT-4o-mini) ──────
    let prediction;
    const predictPayload = userContext
      ? JSON.stringify({ profile, userContext }, null, 2)
      : JSON.stringify(profile, null, 2);
    const predictMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SALARY_PREDICTION_SYSTEM_PROMPT },
      { role: "user", content: predictPayload },
    ];

    try {
      const predictCompletion = await meshClient.chat.completions.create({
        model: "anthropic/claude-sonnet-4.5",
        temperature: 0.2,
        messages: predictMessages,
        tools: [PREDICT_SALARY_TOOL],
        tool_choice: { type: "function", function: { name: "predict_salary" } },
      });

      prediction = sanitizeSalaryPrediction(
        getForcedToolArguments(predictCompletion.choices[0]?.message as ToolCallMessage, "predict_salary")
      );
    } catch {
      // Fallback to GPT-4o-mini
      const fallbackCompletion = await meshClient.chat.completions.create({
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        messages: predictMessages,
        tools: [PREDICT_SALARY_TOOL],
        tool_choice: { type: "function", function: { name: "predict_salary" } },
      });

      prediction = sanitizeSalaryPrediction(
        getForcedToolArguments(fallbackCompletion.choices[0]?.message as ToolCallMessage, "predict_salary")
      );
    }

    // ── Step 3: Generate explanation with GPT-4o ──────────────────────────────
    const explainCompletion = await meshClient.chat.completions.create({
      model: "openai/gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: EXPLAIN_SALARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({ profile, prediction }, null, 2),
        },
      ],
      tools: [EXPLAIN_SALARY_TOOL],
      tool_choice: { type: "function", function: { name: "explain_salary" } },
    });

    const explanation = sanitizeExplanation(
      getForcedToolArguments(explainCompletion.choices[0]?.message as ToolCallMessage, "explain_salary")
    );

    return NextResponse.json({ profile, prediction, explanation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze resume with MeshAPI.";

    const status = message.includes("resumeText is required")
      ? 400
      : message.includes("malformed JSON")
        ? 502
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
