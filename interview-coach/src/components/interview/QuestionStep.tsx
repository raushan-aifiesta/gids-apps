"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronRight,
  Layers,
  BarChart2,
  Flame,
  Brain,
} from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { SessionState } from "./HotSeat";

interface Props {
  session: SessionState;
  onSubmit: (answer: string) => void;
  loading: boolean;
}

const TIMER_SECONDS = 120; // 2 minutes per question

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function QuestionStep({ session, onSubmit, loading }: Props) {
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const q = session.currentQuestion;
  const answeredCount = session.answers.length;
  const isRoast = session.mode === "roast";

  // Reset on new question
  useEffect(() => {
    setAnswer("");
    setTimeLeft(TIMER_SECONDS);
    setTimerActive(true);
    textareaRef.current?.focus();
  }, [q.id]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timerActive, q.id]);

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    clearInterval(timerRef.current!);
    setTimerActive(false);
    onSubmit(answer.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerWarning = timeLeft < 30;
  const timerDanger = timeLeft < 10;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
      className="w-full space-y-4"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 text-sm font-medium ${isRoast ? "text-orange-400" : "text-purple-400"}`}
        >
          {isRoast ? <Flame size={14} /> : <Brain size={14} />}
          {isRoast ? "Roast Mode" : "Coach Mode"}
        </div>
        <ProgressBar
          current={answeredCount + 1}
          total={session.totalQuestions}
        />
      </div>

      {/* Question card */}
      <div
        className={`rounded-2xl border p-6 bg-slate-900/70 backdrop-blur-sm ${
          isRoast
            ? "border-orange-500/20"
            : "border-purple-500/20"
        }`}
      >
        {/* Meta row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${DIFFICULTY_COLORS[q.difficulty]}`}
          >
            <BarChart2 size={10} />
            {q.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-slate-600/40 text-slate-400 bg-slate-800/40">
            <Layers size={10} />
            {q.category}
          </span>
          <span className="ml-auto text-xs text-slate-500">
            Q{q.index} of {session.totalQuestions}
          </span>
        </div>

        {/* Question text */}
        <p className="text-white text-lg md:text-xl leading-relaxed font-medium">
          {q.text}
        </p>

        {/* Role context */}
        {session.role && (
          <p className="mt-3 text-xs text-slate-500">
            Role context: {session.role}
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3">
        <Clock
          size={14}
          className={timerDanger ? "text-red-400" : timerWarning ? "text-amber-400" : "text-slate-500"}
        />
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timerDanger
                ? "bg-red-500"
                : timerWarning
                  ? "bg-amber-500"
                  : isRoast
                    ? "bg-orange-500"
                    : "bg-purple-500"
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
        <span
          className={`text-xs font-mono w-10 text-right ${
            timerDanger ? "text-red-400" : timerWarning ? "text-amber-400" : "text-slate-500"
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Answer input */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Your Answer</label>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRoast
              ? "Don't overthink it. Show me what you've got…"
              : "Take your time and explain your thinking clearly…"
          }
          rows={6}
          disabled={loading}
          className={`w-full px-4 py-3 rounded-xl bg-slate-800/60 border text-white placeholder-slate-600 focus:outline-none transition text-sm leading-relaxed disabled:opacity-50 ${
            isRoast
              ? "border-orange-500/20 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              : "border-slate-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
          }`}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">
            {answer.length} chars · Ctrl+Enter to submit
          </span>
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              isRoast
                ? "bg-orange-600 hover:bg-orange-500"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                Submit <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skills context */}
      {session.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {session.skills.slice(0, 8).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-500 border border-slate-700"
            >
              {s}
            </span>
          ))}
          {session.skills.length > 8 && (
            <span className="px-2 py-0.5 text-xs text-slate-600">
              +{session.skills.length - 8} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
