import { NextResponse } from "next/server";
import {
  evaluateAnswer,
  generateQuestion,
  calculateFinalScore,
} from "@/lib/ai.service";
import type {
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  AnswerRecord,
} from "@/lib/types";

export const runtime = "nodejs";

/**
 * Fully stateless — all session context is passed in from the client.
 * No DB reads or writes. State lives in the browser.
 */
export async function POST(req: Request) {
  try {
    const body: SubmitAnswerRequest & {
      // Full session context sent from client
      mode: "coach" | "roast";
      skills: string[];
      role: string;
      totalQuestions: number;
      answeredCount: number;           // how many have been answered so far (before this one)
      previousCategories: string[];
      previousAnswers: AnswerRecord[]; // for final score calculation
    } = await req.json();

    const {
      questionId,
      answerText,
      questionText,
      questionCategory,
      questionDifficulty,
      questionExpectedTopics,
      mode,
      skills,
      role,
      totalQuestions,
      answeredCount,
      previousCategories,
      previousAnswers,
    } = body;

    if (!questionId || !answerText?.trim()) {
      return NextResponse.json(
        { error: "questionId and answerText are required" },
        { status: 400 },
      );
    }

    const question = {
      id: questionId,
      index: answeredCount + 1,
      text: questionText ?? "Unknown question",
      category: questionCategory ?? "General",
      difficulty: (questionDifficulty ?? "medium") as "easy" | "medium" | "hard",
      expectedTopics: questionExpectedTopics ?? [],
    };

    // Evaluate the answer
    const feedback = await evaluateAnswer({ mode, question, answerText: answerText.trim() });

    const newAnswer: AnswerRecord = {
      questionId,
      questionText: question.text,
      answerText: answerText.trim(),
      feedback,
      answeredAt: new Date(),
    };

    const allAnswers = [...(previousAnswers ?? []), newAnswer];
    const isComplete = allAnswers.length >= totalQuestions;

    let finalScore = undefined;
    let nextQuestion = undefined;

    if (isComplete) {
      finalScore = await calculateFinalScore({ mode, answers: allAnswers });
    } else {
      const nextIndex = allAnswers.length + 1;
      nextQuestion = await generateQuestion({
        mode,
        skills: skills ?? [],
        role: role ?? "Software Engineer",
        questionIndex: nextIndex,
        totalQuestions,
        previousCategories: previousCategories ?? [],
      });
    }

    const response: SubmitAnswerResponse = {
      feedback,
      nextQuestion,
      isComplete,
      finalScore,
      answersRecorded: allAnswers.length,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[interview/answer] error:", err);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}
