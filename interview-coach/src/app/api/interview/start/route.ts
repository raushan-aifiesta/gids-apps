import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { extractResumeSkills, generateQuestion } from "@/lib/ai.service";
import type { StartSessionRequest, StartSessionResponse } from "@/lib/types";

export const runtime = "nodejs";

const DEFAULT_QUESTIONS = 5;
const MAX_QUESTIONS = 10;

export async function POST(req: Request) {
  try {
    const body: StartSessionRequest = await req.json();
    const {
      mode,
      resumeText,
      role: userRole,
      totalQuestions: requestedCount,
    } = body;

    if (!["coach", "roast"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const totalQuestions = Math.min(
      Math.max(requestedCount ?? DEFAULT_QUESTIONS, 3),
      MAX_QUESTIONS,
    );

    // Extract skills from resume if provided
    let skills: string[] = [];
    let role = userRole ?? "Software Engineer";

    if (resumeText?.trim()) {
      const extracted = await extractResumeSkills(resumeText);
      skills = extracted.skills;
      if (!userRole) role = extracted.role;
    }

    // Generate the first question
    const firstQuestion = await generateQuestion({
      mode,
      skills,
      role,
      questionIndex: 1,
      totalQuestions,
      previousCategories: [],
    });

    // Session ID is just a reference key — state lives in the client
    const sessionId = nanoid(12);

    const response: StartSessionResponse = {
      sessionId,
      firstQuestion,
      skills,
      role,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[interview/start] error:", err);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 },
    );
  }
}
