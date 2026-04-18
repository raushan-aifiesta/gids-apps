// ─── Interview modes ────────────────────────────────────────────────────────
export type InterviewMode = "coach" | "roast";

// ─── Session ─────────────────────────────────────────────────────────────────
export interface InterviewSession {
  sessionId: string;
  mode: InterviewMode;
  skills: string[];           // extracted from resume PDF
  role?: string;              // inferred from resume or user-provided
  totalQuestions: number;
  currentQuestion: number;
  answers: AnswerRecord[];
  finalScore?: FinalScore;
  email?: string;
  createdAt: Date;
  completedAt?: Date;
}

// ─── Question ────────────────────────────────────────────────────────────────
export interface Question {
  id: string;
  index: number;
  text: string;
  category: string;           // e.g. "System Design", "JS Fundamentals"
  difficulty: "easy" | "medium" | "hard";
  expectedTopics: string[];   // hints for the evaluator
}

// ─── Answer record ───────────────────────────────────────────────────────────
export interface AnswerRecord {
  questionId: string;
  questionText: string;
  answerText: string;
  feedback: AnswerFeedback;
  answeredAt: Date;
}

// ─── Per-answer feedback (structured JSON from AI) ──────────────────────────
export interface AnswerFeedback {
  score: number;              // 1–10
  accuracy: number;           // 0–100 percent
  clarity: number;            // 0–100 percent
  whatYouMissed: string[];    // bullet list of missed points
  strengths: string[];        // what they got right
  roastLine?: string;         // witty burn — only in roast mode
  encouragement?: string;     // only in coach mode
  detailedFeedback: string;   // paragraph for full report
}

// ─── Final score ─────────────────────────────────────────────────────────────
export interface FinalScore {
  overall: number;            // 1–100
  accuracy: number;
  clarity: number;
  consistency: number;        // how steady across questions
  rank?: string;              // "Senior", "Mid", "Junior", "Intern"
  summary: string;            // one-paragraph summary for the report
  roastSummary?: string;      // roast mode closing line
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  _id?: string;
  sessionId?: string;
  nickname: string;
  score: number;
  mode: InterviewMode;
  rank: string;
  questionCount: number;
  createdAt: Date;
}

// ─── API request / response shapes ──────────────────────────────────────────
export interface StartSessionRequest {
  mode: InterviewMode;
  resumeText?: string;
  role?: string;
  totalQuestions?: number;
}

export interface StartSessionResponse {
  sessionId: string;
  firstQuestion: Question;
  skills: string[];
  role: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answerText: string;
  // Question context passed from client to avoid an extra DB read
  questionText?: string;
  questionCategory?: string;
  questionDifficulty?: string;
  questionExpectedTopics?: string[];
}

export interface SubmitAnswerResponse {
  feedback: AnswerFeedback;
  nextQuestion?: Question;
  isComplete: boolean;
  finalScore?: FinalScore;
  answersRecorded: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  dbHealthy: boolean;
}

export interface EmailReportRequest {
  sessionId: string;
  email: string;
}
