import { NextResponse } from "next/server";
import OpenAI from "openai";
import { nanoid } from "nanoid";
import { uploadToGCS } from "@/lib/gcs";
import {
  EXTRACT_PROFILE_SYSTEM_PROMPT,
  GENERATE_RESUME_SYSTEM_PROMPT,
  sanitizeCandidateProfile,
  sanitizeResumeContent,
} from "@/lib/prompts";
import type { CandidateProfile, ResumeContent } from "@/lib/types";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

export async function POST(req: Request) {
  try {
    const { linkedInData, githubData, documentText, uploadedFileGcsPath } =
      await req.json();

    if (!linkedInData && !githubData && !documentText) {
      return NextResponse.json(
        { error: "At least one data source is required" },
        { status: 400 }
      );
    }

    // ── Step 1: Extract structured profile (Gemini 2.5 Flash) ──────────────
    const sourceParts: string[] = [];
    if (linkedInData) {
      sourceParts.push(`## LinkedIn Profile Data\n${JSON.stringify(linkedInData, null, 2)}`);
    }
    if (githubData) {
      sourceParts.push(`## GitHub Profile Data\n${JSON.stringify(githubData, null, 2)}`);
    }
    if (documentText) {
      sourceParts.push(`## Uploaded Document Text\n${documentText}`);
    }

    const parseResponse = await meshClient.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      temperature: 0.1,
      messages: [
        { role: "system", content: EXTRACT_PROFILE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Please extract a comprehensive candidate profile from the following sources:\n\n${sourceParts.join("\n\n")}`,
        },
      ],
    });

    const parseContent = parseResponse.choices[0]?.message?.content;
    if (!parseContent) {
      throw new Error("Profile extraction failed: no response content");
    }
    // Extract JSON from markdown code blocks if present
    const jsonMatch = parseContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || [null, parseContent];
    const profile: CandidateProfile = sanitizeCandidateProfile(JSON.parse(jsonMatch[1]));

    // ── Step 2: Generate polished resume content (Claude Sonnet 4.6) ────────
    const generateResponse = await meshClient.chat.completions.create({
      model: "anthropic/claude-sonnet-4.6",
      temperature: 0.4,
      messages: [
        { role: "system", content: GENERATE_RESUME_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate a polished, ATS-optimized resume from this candidate profile:\n\n${JSON.stringify(profile, null, 2)}`,
        },
      ],
    });

    const generateContent = generateResponse.choices[0]?.message?.content;
    if (!generateContent) {
      throw new Error("Resume generation failed: no response content");
    }
    // Extract JSON from markdown code blocks if present
    const resumeJsonMatch = generateContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || [null, generateContent];
    const resumeContent: ResumeContent = sanitizeResumeContent(JSON.parse(resumeJsonMatch[1]));

    // ── Step 3: Render PDF and upload to GCS ────────────────────────────────
    const { renderResumePdf } = await import("@/lib/pdfRenderer");
    const pdfBuffer = await renderResumePdf(resumeContent);

    const id = nanoid();
    const pdfGcsPath = `generated-resumes/${id}/resume.pdf`;
    const pdfGcsUrl = await uploadToGCS(pdfBuffer, pdfGcsPath, "application/pdf");

    return NextResponse.json({
      resumeContent,
      pdfGcsUrl,
      uploadedFileGcsPath: uploadedFileGcsPath ?? null,
    });
  } catch (error) {
    console.error("[generate] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Resume generation failed" },
      { status: 500 }
    );
  }
}
