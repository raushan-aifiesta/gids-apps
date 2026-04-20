import { NextResponse } from "next/server";
import OpenAI from "openai";
import { LABOR_MARKET_ANALYST_SYSTEM_PROMPT, sanitizeJobAnalysis } from "@/lib/prompts";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
    const context = (body.context ?? {}) as Record<string, string>;

    if (!jobTitle || jobTitle.length < 2) {
      return NextResponse.json({ error: "A valid job title is required" }, { status: 400 });
    }
    if (jobTitle.length > 200) {
      return NextResponse.json({ error: "Job title too long" }, { status: 400 });
    }

    const contextLines: string[] = [];
    if (context.workRoutine) contextLines.push(`Work routine: ${context.workRoutine.replace(/_/g, " ")}`);
    if (context.humanConnection) contextLines.push(`Human connection dependency: ${context.humanConnection.replace(/_/g, " ")}`);
    if (context.creativeJudgment) contextLines.push(`Creative judgment frequency: ${context.creativeJudgment}`);
    if (context.outputType) contextLines.push(`Output type: ${context.outputType.replace(/_/g, " ")}`);
    const contextSection = contextLines.length > 0
      ? `\n\nUser context:\n${contextLines.join("\n")}`
      : "";

    const response = await meshClient.chat.completions.create({
      model: "google/gemini-2-5-flash",
      temperature: 0.2,
      messages: [
        { role: "system", content: LABOR_MARKET_ANALYST_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze the automation risk for this job title: "${jobTitle}"${contextSection}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from AI");
    }

    // Strip markdown code fences if the model wraps JSON in them
    const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    const jsonText = fenceMatch ? fenceMatch[1].trim() : content.trim();
    const parsed: unknown = JSON.parse(jsonText);
    const analysis = sanitizeJobAnalysis(parsed);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[analyze] error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
