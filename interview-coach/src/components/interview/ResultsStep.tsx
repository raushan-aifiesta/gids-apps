"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  BarChart2,
  Flame,
  Brain,
  Star,
} from "lucide-react";
import type { SessionState } from "./HotSeat";
import { apiPath } from "@/lib/basePath";

interface Props {
  session: SessionState;
  onViewLeaderboard: () => void;
  onRestart: () => void;
}

const RANK_META = {
  Senior: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", emoji: "🏆" },
  Mid: { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/30", emoji: "⚡" },
  Junior: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", emoji: "🌱" },
  Intern: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", emoji: "📚" },
};

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(t);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{value}</>;
}

export default function ResultsStep({
  session,
  onViewLeaderboard,
  onRestart,
}: Props) {
  const finalScore = session.finalScore!;
  const isRoast = session.mode === "roast";
  const rankMeta = RANK_META[finalScore.rank as keyof typeof RANK_META] ?? RANK_META.Junior;
  const didGreat = finalScore.overall >= 70;
  const confettiFiredRef = useRef(false);

  // Save to leaderboard + fire confetti
  useEffect(() => {
    // Leaderboard save
    fetch(apiPath("/api/leaderboard"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.sessionId,
        nickname: "Anonymous",
        score: finalScore.overall,
        mode: session.mode,
        rank: finalScore.rank,
        questionCount: session.totalQuestions,
        createdAt: new Date(),
      }),
    }).catch(() => {/* non-fatal */});

    // Confetti for good scores
    if (didGreat && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        const fire = (opts: Record<string, unknown>) =>
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 }, ...opts });
        setTimeout(() => fire({ colors: ["#7c3aed", "#06b6d4", "#10b981"] }), 300);
        setTimeout(() => fire({ colors: ["#a78bfa", "#67e8f9", "#6ee7b7"], angle: 120 }), 600);
        setTimeout(() => fire({ colors: ["#7c3aed", "#06b6d4"], angle: 60 }), 900);
      });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const statCard = (label: string, value: number) => (
    <div className="flex-1 text-center p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
      <div className="text-2xl font-bold text-white">
        <AnimatedNumber target={value} />
        <span className="text-sm text-slate-500">%</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-3 ${rankMeta.bg} ${rankMeta.border}`}
          style={{ color: rankMeta.color }}
        >
          {rankMeta.emoji} {finalScore.rank} Level
        </div>
        <h2 className="text-3xl font-bold text-white mb-1">Session Complete</h2>
        <p className="text-slate-400 inline-flex items-center gap-1.5">
          {isRoast ? (
            <span className="text-orange-400 inline-flex items-center gap-1">
              <Flame size={12} /> Roast Mode
            </span>
          ) : (
            <span className="text-purple-400 inline-flex items-center gap-1">
              <Brain size={12} /> Coach Mode
            </span>
          )}
        </p>
      </div>

      {/* Main score */}
      <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at center, ${rankMeta.color}, transparent 70%)`,
          }}
        />
        <div
          className="text-8xl font-black mb-1"
          style={{ color: rankMeta.color }}
        >
          <AnimatedNumber target={finalScore.overall} duration={1800} />
        </div>
        <div className="text-slate-500 text-sm">out of 100</div>

        {/* Star rating */}
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={18}
              className={
                i < Math.round(finalScore.overall / 20)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-700"
              }
            />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        {statCard("Accuracy", finalScore.accuracy)}
        {statCard("Clarity", finalScore.clarity)}
        {statCard("Consistency", finalScore.consistency)}
      </div>

      {/* Summary */}
      <div className="px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <p className="text-slate-300 text-sm leading-relaxed">{finalScore.summary}</p>
        {isRoast && finalScore.roastSummary && (
          <p className="mt-2 text-orange-400 text-sm italic">
            💀 {finalScore.roastSummary}
          </p>
        )}
      </div>

      {/* Per-question summary strip */}
      <div className="space-y-2">
        <h4 className="text-xs text-slate-500 uppercase tracking-wide font-semibold flex items-center gap-1">
          <BarChart2 size={11} /> Per-question scores
        </h4>
        <div className="flex gap-2 flex-wrap">
          {session.answers.map((a, i) => {
            const s = a.feedback.score;
            const color =
              s >= 7 ? "bg-emerald-500" : s >= 4 ? "bg-amber-500" : "bg-red-500";
            return (
              <div key={i} className="group relative">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${color}`}
                >
                  {s}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 z-10 pointer-events-none">
                  Q{i + 1}: {a.questionText.slice(0, 60)}…
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onViewLeaderboard}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition ${
            isRoast
              ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
              : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
          }`}
        >
          <Trophy size={16} />
          Leaderboard
        </button>
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-600 bg-slate-800/40 hover:bg-slate-700/40 text-slate-300 text-sm font-semibold transition"
        >
          <RotateCcw size={16} />
          Play Again
        </button>
      </div>

    </motion.div>
  );
}
