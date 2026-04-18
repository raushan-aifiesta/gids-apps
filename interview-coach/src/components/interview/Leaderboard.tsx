"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Brain,
  RotateCcw,
  Crown,
  WifiOff,
} from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";
import type { SessionState } from "./HotSeat";

interface Props {
  currentSession: SessionState;
  onRestart: () => void;
}

const RANK_COLORS: Record<string, string> = {
  Senior: "text-emerald-400",
  Mid: "text-blue-400",
  Junior: "text-amber-400",
  Intern: "text-red-400",
};

export default function LeaderboardStep({ currentSession, onRestart }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myScore = currentSession.finalScore?.overall ?? 0;
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);
  const myRank =
    sortedEntries.findIndex((e) => e.sessionId === currentSession.sessionId) + 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
        <p className="text-slate-500 text-sm">Loading leaderboard…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <Trophy size={32} className="mx-auto text-amber-400 mb-2" />
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <p className="text-slate-500 text-sm">Top performances today</p>
      </div>

      {/* My rank highlight */}
      {myRank > 0 && (
        <div className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
          <span className="text-purple-300 text-sm font-medium">Your rank</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">#{myRank}</span>
            <span className="text-purple-400 font-bold">{myScore}</span>
          </div>
        </div>
      )}

      {/* Top list */}
      <div className="space-y-2">
        {sortedEntries.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No entries yet. You could be first!
          </p>
        )}
        {sortedEntries.map((entry, i) => {
          const isMe = entry.sessionId === currentSession.sessionId;
          const medalColors = ["text-amber-400", "text-slate-400", "text-amber-600"];

          return (
            <motion.div
              key={entry._id ?? i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                isMe
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-slate-800/40 border-slate-700/30 hover:border-slate-600/50"
              }`}
            >
              {/* Rank */}
              <div className="w-7 text-center">
                {i < 3 ? (
                  <Crown size={16} className={medalColors[i]} fill="currentColor" />
                ) : (
                  <span className="text-slate-500 text-sm">{i + 1}</span>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium truncate block ${isMe ? "text-purple-300" : "text-slate-200"}`}
                >
                  Anonymous
                  {isMe && (
                    <span className="ml-1.5 text-xs text-purple-400">(you)</span>
                  )}
                </span>
                <span className={`text-xs ${RANK_COLORS[entry.rank] ?? "text-slate-500"}`}>
                  {entry.rank}
                </span>
              </div>

              {/* Mode badge */}
              <div>
                {entry.mode === "roast" ? (
                  <Flame size={12} className="text-orange-400" />
                ) : (
                  <Brain size={12} className="text-purple-400" />
                )}
              </div>

              {/* Score */}
              <div
                className={`text-lg font-bold w-10 text-right ${
                  entry.score >= 80
                    ? "text-emerald-400"
                    : entry.score >= 60
                      ? "text-blue-400"
                      : "text-slate-300"
                }`}
              >
                {entry.score}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-semibold transition"
      >
        <RotateCcw size={15} />
        Play Again
      </button>
    </motion.div>
  );
}
