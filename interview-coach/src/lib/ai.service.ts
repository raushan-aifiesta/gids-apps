/**
 * Central AI service — follows the same MeshAPI/OpenAI-SDK pattern as resume-builder.
 * All model calls go through a single meshClient instance.
 */

import OpenAI from "openai";
import { nanoid } from "nanoid";
import {
  getQuestionSystemPrompt,
  getEvaluationSystemPrompt,
  getFinalScoreSystemPrompt,
  getSkillExtractionPrompt,
  extractJSON,
} from "./prompts";
import type {
  InterviewMode,
  Question,
  AnswerFeedback,
  AnswerRecord,
  FinalScore,
} from "./types";

// ─── MeshAPI client (identical pattern to resume-builder) ───────────────────
const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

// Model routing — use fast model for structured tasks, strong model for evals
const FAST_MODEL = "google/gemini-2-5-flash";
const STRONG_MODEL = "anthropic/claude-sonnet-4-6";

// ─── Extract skills from resume text ────────────────────────────────────────
export async function extractResumeSkills(
  resumeText: string,
): Promise<{ skills: string[]; role: string; yearsExperience: number | null }> {
  const response = await meshClient.chat.completions.create({
    model: FAST_MODEL,
    temperature: 0.1,
    messages: [
      { role: "system", content: getSkillExtractionPrompt() },
      { role: "user", content: `Resume text:\n\n${resumeText.slice(0, 12000)}` },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = extractJSON<{
    skills: string[];
    role: string;
    yearsExperience: number | null;
  }>(content);

  return {
    skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 20) : [],
    role: parsed.role ?? "Software Engineer",
    yearsExperience: parsed.yearsExperience ?? null,
  };
}

// ─── Generate a single interview question ───────────────────────────────────
export async function generateQuestion(params: {
  mode: InterviewMode;
  skills: string[];
  role: string;
  questionIndex: number;      // 1-based
  totalQuestions: number;
  previousCategories: string[]; // avoid repeating
}): Promise<Question> {
  const { mode, skills, role, questionIndex, totalQuestions, previousCategories } = params;

  const systemPrompt = getQuestionSystemPrompt(mode, skills, role, totalQuestions);
  const userMessage =
    `Generate question #${questionIndex} of ${totalQuestions}. ` +
    (previousCategories.length > 0
      ? `Avoid these already-used categories: ${previousCategories.join(", ")}. `
      : "") +
    "Return only the JSON object.";

  const response = await meshClient.chat.completions.create({
    model: FAST_MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = extractJSON<Partial<Question>>(content);

  return {
    id: parsed.id ?? `q_${nanoid(6)}`,
    index: questionIndex,
    text: parsed.text ?? "Describe a challenging technical problem you solved recently.",
    category: parsed.category ?? "General",
    difficulty: parsed.difficulty ?? "medium",
    expectedTopics: Array.isArray(parsed.expectedTopics) ? parsed.expectedTopics : [],
  };
}

// ─── Evaluate a candidate's answer ──────────────────────────────────────────
export async function evaluateAnswer(params: {
  mode: InterviewMode;
  question: Question;
  answerText: string;
}): Promise<AnswerFeedback> {
  const { mode, question, answerText } = params;

  const userMessage =
    `Question: ${question.text}\n\n` +
    `Category: ${question.category} | Difficulty: ${question.difficulty}\n` +
    `Expected topics to cover: ${question.expectedTopics.join(", ")}\n\n` +
    `Candidate answer:\n${answerText.slice(0, 4000)}`;

  const response = await meshClient.chat.completions.create({
    model: STRONG_MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: getEvaluationSystemPrompt(mode) },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = extractJSON<Partial<AnswerFeedback>>(content);

  return {
    score: clamp(Number(parsed.score ?? 5), 1, 10),
    accuracy: clamp(Number(parsed.accuracy ?? 50), 0, 100),
    clarity: clamp(Number(parsed.clarity ?? 50), 0, 100),
    whatYouMissed: Array.isArray(parsed.whatYouMissed) ? parsed.whatYouMissed : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    roastLine: parsed.roastLine,
    encouragement: parsed.encouragement,
    detailedFeedback:
      parsed.detailedFeedback ?? "No detailed feedback available.",
  };
}

// ─── Calculate final score from all answers ──────────────────────────────────
export async function calculateFinalScore(params: {
  mode: InterviewMode;
  answers: AnswerRecord[];
}): Promise<FinalScore> {
  const { mode, answers } = params;

  const answerSummary = answers
    .map(
      (a, i) =>
        `Q${i + 1} [${a.questionText.slice(0, 80)}]: score=${a.feedback.score}/10, accuracy=${a.feedback.accuracy}%, clarity=${a.feedback.clarity}%`,
    )
    .join("\n");

  const response = await meshClient.chat.completions.create({
    model: STRONG_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: getFinalScoreSystemPrompt(mode) },
      {
        role: "user",
        content: `Session summary (${answers.length} questions):\n${answerSummary}\n\nCompute the final score JSON.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = extractJSON<Partial<FinalScore>>(content);

  const overall = clamp(Number(parsed.overall ?? 50), 1, 100);
  return {
    overall,
    accuracy: clamp(Number(parsed.accuracy ?? 50), 0, 100),
    clarity: clamp(Number(parsed.clarity ?? 50), 0, 100),
    consistency: clamp(Number(parsed.consistency ?? 50), 0, 100),
    rank: inferRank(overall, parsed.rank),
    summary: parsed.summary ?? "Session complete.",
    roastSummary: parsed.roastSummary ?? undefined,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function inferRank(
  overall: number,
  aiRank?: string,
): "Senior" | "Mid" | "Junior" | "Intern" {
  const valid = ["Senior", "Mid", "Junior", "Intern"];
  if (aiRank && valid.includes(aiRank))
    return aiRank as "Senior" | "Mid" | "Junior" | "Intern";
  if (overall >= 80) return "Senior";
  if (overall >= 60) return "Mid";
  if (overall >= 40) return "Junior";
  return "Intern";
}
