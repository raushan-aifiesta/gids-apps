import { NextRequest, NextResponse } from "next/server";
import { meshClient, SCREENING_MODEL } from "@/lib/meshClient";
import { extractTextFromFile } from "@/lib/pdfExtract";
import { SCREENING_SYSTEM_PROMPT, buildScreeningUserPrompt } from "@/lib/prompts";
import type { CandidateResult, ScreeningResponse } from "@/lib/types";

export const maxDuration = 120; // 2 minutes for up to 5 parallel AI calls

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const jdFile = formData.get("jobDescription") as File | null;
  const resumeFiles = formData.getAll("resumes") as File[];

  if (!jdFile) {
    return NextResponse.json(
      { error: "Job description is required." },
      { status: 400 },
    );
  }
  if (resumeFiles.length === 0) {
    return NextResponse.json(
      { error: "At least one resume is required." },
      { status: 400 },
    );
  }
  if (resumeFiles.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 resumes allowed per screening." },
      { status: 400 },
    );
  }

  // Extract text from all documents in parallel
  let jdText: string;
  let resumeTexts: Array<{ fileName: string; text: string }>;

  try {
    [jdText, ...resumeTexts] = await Promise.all([
      extractTextFromFile(jdFile),
      ...resumeFiles.map(async (f) => ({
        fileName: f.name,
        text: await extractTextFromFile(f),
      })),
    ]);
  } catch (err) {
    console.error("Text extraction error:", err);
    return NextResponse.json(
      {
        error: "Failed to extract text from one or more files.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 422 },
    );
  }

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json(
      { error: "Could not extract meaningful text from the job description." },
      { status: 422 },
    );
  }

  // Screen all resumes in parallel against the JD
  const screeningResults = await Promise.allSettled(
    resumeTexts.map(({ fileName, text }) =>
      screenCandidate(fileName, jdText, text),
    ),
  );

  const candidates: CandidateResult[] = [];
  const errors: string[] = [];

  for (let i = 0; i < screeningResults.length; i++) {
    const result = screeningResults[i];
    if (result.status === "fulfilled") {
      candidates.push(result.value);
    } else {
      const fileName = resumeTexts[i].fileName;
      console.error(`Screening failed for ${fileName}:`, result.reason);
      errors.push(`${fileName}: ${result.reason?.message ?? "Unknown error"}`);
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      {
        error: "All resume screenings failed.",
        details: errors.join("; "),
      },
      { status: 500 },
    );
  }

  // Sort by totalFit descending
  candidates.sort((a, b) => b.totalFit - a.totalFit);

  const response: ScreeningResponse = {
    candidates,
    jobTitle: candidates[0]?.jobTitle ?? "Unknown Role",
    screenedAt: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

async function screenCandidate(
  fileName: string,
  jdText: string,
  resumeText: string,
): Promise<CandidateResult> {
  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error("Resume text is too short or empty.");
  }

  const completion = await meshClient.chat.completions.create({
    model: SCREENING_MODEL,
    temperature: 0.1,
    messages: [
      { role: "system", content: SCREENING_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildScreeningUserPrompt(jdText, resumeText),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  return {
    fileName,
    candidateName: String(parsed.candidateName ?? "Unknown"),
    totalFit: clamp(Number(parsed.totalFit ?? 0)),
    categories: {
      technicalFit: extractCategory(parsed, "technicalFit"),
      experienceLevel: extractCategory(parsed, "experienceLevel"),
      education: extractCategory(parsed, "education"),
      softSkills: extractCategory(parsed, "softSkills"),
    },
    summary: String(parsed.summary ?? ""),
    topStrengths: toStringArray(parsed.topStrengths),
    gaps: toStringArray(parsed.gaps),
    jobTitle: String(parsed.jobTitle ?? ""),
  };
}

function extractCategory(
  parsed: Record<string, unknown>,
  key: string,
): { score: number; justification: string } {
  const cat = (parsed.categories as Record<string, unknown>)?.[key] as
    | Record<string, unknown>
    | undefined;
  return {
    score: clamp(Number(cat?.score ?? 0)),
    justification: String(cat?.justification ?? ""),
  };
}

function clamp(n: number, min = 1, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map(String).filter(Boolean);
}
