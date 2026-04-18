"use client";

import { Users, Clock, RotateCcw } from "lucide-react";
import { CandidateCard } from "./CandidateCard";
import type { ScreeningResponse } from "@/lib/types";

interface ResultsDashboardProps {
  data: ScreeningResponse;
  onReset: () => void;
}

export function ResultsDashboard({ data, onReset }: ResultsDashboardProps) {
  const avg =
    data.candidates.length > 0
      ? Math.round(
          data.candidates.reduce((s, c) => s + c.totalFit, 0) /
            data.candidates.length,
        )
      : 0;

  const screenedDate = new Date(data.screenedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{data.candidates.length}</p>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1">
            <Users className="h-3 w-3" /> Candidates
          </p>
        </div>
        <div className="text-center border-x border-slate-700/50">
          <p className="text-2xl font-bold text-white">{avg}</p>
          <p className="text-xs text-slate-400 mt-0.5">Avg Role Fit</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {data.candidates[0]?.totalFit ?? "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Top Score</p>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Screening Results
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" /> {screenedDate} · Ranked by Role Fit
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Screening
        </button>
      </div>

      {/* Candidate cards */}
      <div className="space-y-3">
        {data.candidates.map((candidate, i) => (
          <CandidateCard
            key={candidate.fileName + i}
            candidate={candidate}
            rank={i + 1}
          />
        ))}
      </div>
    </div>
  );
}
