import { NextResponse } from "next/server";
import { sendInterviewReport } from "@/lib/resend";
import type { AnswerRecord, FinalScore, InterviewMode } from "@/lib/types";

export const runtime = "nodejs";

interface EmailReportBody {
  email: string;
  sessionId: string;
  nickname: string;
  mode: InterviewMode;
  answers: AnswerRecord[];
  finalScore: FinalScore;
}

export async function POST(req: Request) {
  try {
    const body: EmailReportBody = await req.json();
    const { email, sessionId, nickname, mode, answers, finalScore } = body;

    if (!email?.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }
    if (!answers?.length || !finalScore) {
      return NextResponse.json(
        { error: "Session data is missing" },
        { status: 400 },
      );
    }

    await sendInterviewReport({
      email,
      nickname: nickname ?? "Anonymous",
      mode,
      answers,
      finalScore,
      sessionId,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[email] error:", err);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 },
    );
  }
}
