/**
 * Drizzle-style schema definitions for MongoDB collections.
 * Used as the source-of-truth for TypeScript types and collection names.
 *
 * Runtime DB operations use the native MongoDB driver via db.ts.
 * These interfaces mirror the Drizzle schema declaration style for consistency.
 */

import type { InterviewMode, AnswerRecord, FinalScore } from "@/lib/types";

// ─── Collection names ────────────────────────────────────────────────────────
export const COLLECTIONS = {
  SESSIONS: "sessions",
  LEADERBOARD: "leaderboard",
  USERS: "users",
} as const;

// ─── Sessions collection ─────────────────────────────────────────────────────
export interface SessionDocument {
  _id?: string;
  sessionId: string;              // nanoid — client-facing ID
  nickname: string;
  mode: InterviewMode;
  skills: string[];
  role: string;
  totalQuestions: number;
  currentQuestion: number;       // 0-based progress index
  questionCategories: string[];  // track used categories to avoid repeats
  answers: AnswerRecord[];
  finalScore?: FinalScore;
  email?: string;
  reportSentAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

// ─── Leaderboard collection ──────────────────────────────────────────────────
export interface LeaderboardDocument {
  _id?: string;
  sessionId: string;
  nickname: string;
  score: number;                  // overall 1–100
  mode: InterviewMode;
  rank: string;
  questionCount: number;
  createdAt: Date;
}

// ─── Users collection (email captures) ──────────────────────────────────────
export interface UserDocument {
  _id?: string;
  email: string;
  nickname?: string;
  sessionIds: string[];           // sessions associated with this email
  subscribedAt: Date;
  source: "interview-coach";
}
