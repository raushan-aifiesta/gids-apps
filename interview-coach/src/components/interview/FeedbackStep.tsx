"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  Flame,
  Brain,
  TrendingUp,
  Target,
} from "lucide-react";
import type { AnswerFeedback, InterviewMode, Question } from "@/lib/types";

interface Props {
  question: Question;
  feedback: AnswerFeedback;
  mode: InterviewMode;
  answeredCount: number;
  totalQuestions: number;
  isLast: boolean;
  onContinue: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const color =
    score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
        <span className="text-[9px] text-slate-500">/10</span>
      </div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function FeedbackStep({
  question,
  feedback,
  mode,
  answeredCount,
  totalQuestions,
  isLast,
  onContinue,
}: Props) {
  const isRoast = mode === "roast";
  const scoreColor =
    feedback.score >= 7
      ? "text-emerald-400"
      : feedback.score >= 4
        ? "text-amber-400"
        : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {isRoast ? (
          <Flame className="text-orange-400" size={18} />
        ) : (
          <Brain className="text-purple-400" size={18} />
        )}
        <span className="text-slate-400 text-sm">
          Question {answeredCount} of {totalQuestions} · Feedback
        </span>
      </div>

      {/* Question recap */}
      <div className="px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
          {question.text}
        </p>
      </div>

      {/* Score + stats */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-sm p-5">
        <div className="flex items-start gap-5">
          <ScoreRing score={feedback.score} />
          <div className="flex-1 space-y-3">
            <StatBar label="Accuracy" value={feedback.accuracy} />
            <StatBar label="Clarity" value={feedback.clarity} />
          </div>
        </div>
      </div>

      {/* Roast line / Encouragement */}
      {isRoast && feedback.roastLine && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20"
        >
          <Flame size={16} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-orange-300 text-sm italic">{feedback.roastLine}</p>
        </motion.div>
      )}
      {!isRoast && feedback.encouragement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <TrendingUp size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-emerald-300 text-sm">{feedback.encouragement}</p>
        </motion.div>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            What you got right
          </h4>
          {feedback.strengths.map((s, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-300">
              <CheckCircle
                size={14}
                className="text-emerald-400 shrink-0 mt-0.5"
              />
              {s}
            </div>
          ))}
        </div>
      )}

      {/* What you missed */}
      {feedback.whatYouMissed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Target size={11} />
            What you missed
          </h4>
          {feedback.whatYouMissed.map((m, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-400">
              <XCircle
                size={14}
                className="text-red-400/70 shrink-0 mt-0.5"
              />
              {m}
            </div>
          ))}
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all ${
          isRoast
            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
            : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
        }`}
      >
        {isLast ? (
          <>
            See Final Results <ChevronRight size={16} />
          </>
        ) : (
          <>
            Next Question <ChevronRight size={16} />
          </>
        )}
      </button>
    </motion.div>
  );
}
