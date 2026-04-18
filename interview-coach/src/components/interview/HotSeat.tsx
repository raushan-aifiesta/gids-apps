"use client";

import { useState, useCallback } from "react";
import type {
  InterviewMode,
  Question,
  AnswerFeedback,
  AnswerRecord,
  FinalScore,
  StartSessionResponse,
  SubmitAnswerResponse,
} from "@/lib/types";
import WelcomeStep from "./WelcomeStep";
import QuestionStep from "./QuestionStep";
import FeedbackStep from "./FeedbackStep";
import ResultsStep from "./ResultsStep";
import LeaderboardStep from "./Leaderboard";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { apiPath } from "@/lib/basePath";

type AppStep = "welcome" | "question" | "feedback" | "results" | "leaderboard";

export interface SessionState {
  sessionId: string;
  mode: InterviewMode;
  skills: string[];
  role: string;
  totalQuestions: number;
  currentQuestion: Question;
  answers: AnswerRecord[];
  lastFeedback?: AnswerFeedback;
  lastQuestion?: Question;
  finalScore?: FinalScore;
}

export default function HotSeat() {
  const [step, setStep] = useState<AppStep>("welcome");
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Welcome → Question ────────────────────────────────────────────────────
  const handleSessionStart = useCallback(
    async (params: {
      mode: InterviewMode;
      resumeText?: string;
      role?: string;
      totalQuestions: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiPath("/api/interview/start"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to start session");
        }
        const data: StartSessionResponse = await res.json();
        setSession({
          sessionId: data.sessionId,
          mode: params.mode,
          skills: data.skills,
          role: data.role,
          totalQuestions: params.totalQuestions,
          currentQuestion: data.firstQuestion,
          answers: [],
        });
        setStep("question");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Question → Feedback ──────────────────────────────────────────────────
  const handleAnswerSubmit = useCallback(
    async (answerText: string) => {
      if (!session) return;
      setLoading(true);
      setError(null);
      try {
        const q = session.currentQuestion;
        const res = await fetch(apiPath("/api/interview/answer"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            questionId: q.id,
            answerText,
            questionText: q.text,
            questionCategory: q.category,
            questionDifficulty: q.difficulty,
            questionExpectedTopics: q.expectedTopics,
            mode: session.mode,
            skills: session.skills,
            role: session.role,
            totalQuestions: session.totalQuestions,
            answeredCount: session.answers.length,
            previousCategories: session.answers.map((a) => a.questionText),
            previousAnswers: session.answers,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to submit answer");
        }
        const data: SubmitAnswerResponse = await res.json();

        const newAnswer: AnswerRecord = {
          questionId: q.id,
          questionText: q.text,
          answerText,
          feedback: data.feedback,
          answeredAt: new Date(),
        };

        setSession((prev) =>
          prev
            ? {
                ...prev,
                answers: [...prev.answers, newAnswer],
                lastFeedback: data.feedback,
                lastQuestion: q,
                currentQuestion: data.nextQuestion ?? prev.currentQuestion,
                finalScore: data.finalScore,
              }
            : prev,
        );
        setStep("feedback");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  // ─── Feedback → next Question or Results ──────────────────────────────────
  const handleFeedbackContinue = useCallback(() => {
    if (!session) return;
    if (session.finalScore) {
      setStep("results");
    } else {
      setStep("question");
    }
  }, [session]);

  // ─── Results → Leaderboard ─────────────────────────────────────────────────
  const handleViewLeaderboard = useCallback(() => {
    setStep("leaderboard");
  }, []);

  // ─── Restart ──────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    setSession(null);
    setError(null);
    setStep("welcome");
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <AnimatedBackground mode={session?.mode} />

      <div className="relative z-10 w-full max-w-2xl">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {step === "welcome" && (
          <WelcomeStep onStart={handleSessionStart} loading={loading} />
        )}

        {step === "question" && session && (
          <QuestionStep
            session={session}
            onSubmit={handleAnswerSubmit}
            loading={loading}
          />
        )}

        {step === "feedback" && session?.lastFeedback && session.lastQuestion && (
          <FeedbackStep
            question={session.lastQuestion}
            feedback={session.lastFeedback}
            mode={session.mode}
            answeredCount={session.answers.length}
            totalQuestions={session.totalQuestions}
            isLast={!!session.finalScore}
            onContinue={handleFeedbackContinue}
          />
        )}

        {step === "results" && session?.finalScore && (
          <ResultsStep
            session={session}
            onViewLeaderboard={handleViewLeaderboard}
            onRestart={handleRestart}
          />
        )}

        {step === "leaderboard" && session && (
          <LeaderboardStep
            currentSession={session}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
