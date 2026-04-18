"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { cn, scoreBadgeStyle, scoreColor } from "@/lib/utils";
import { ScoreBar } from "./ScoreBar";
import type { CandidateResult } from "@/lib/types";

interface CandidateCardProps {
  candidate: CandidateResult;
  rank: number;
}

export function CandidateCard({ candidate, rank }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(rank === 1);

  const { categories } = candidate;

  return (
    <div
      className={cn(
        "rounded-xl border bg-slate-800/60 backdrop-blur-sm transition-all duration-200",
        rank === 1
          ? "border-emerald-500/40 shadow-lg shadow-emerald-500/10"
          : "border-slate-700/50 hover:border-slate-600/60",
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Rank badge */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            rank === 1
              ? "bg-emerald-500 text-white"
              : rank === 2
                ? "bg-sky-500/80 text-white"
                : "bg-slate-600 text-slate-300",
          )}
        >
          {rank}
        </div>

        {/* Name & file */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{candidate.candidateName}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
            <FileText className="h-3 w-3 shrink-0" />
            {candidate.fileName}
          </p>
        </div>

        {/* Total fit badge */}
        <div
          className={cn(
            "shrink-0 rounded-lg border px-3 py-1.5 text-center",
            scoreBadgeStyle(candidate.totalFit),
          )}
        >
          <p className="text-xl font-bold leading-none">{candidate.totalFit}</p>
          <p className="text-[10px] mt-0.5 opacity-80">Role Fit</p>
        </div>

        {/* Expand toggle */}
        <div className="text-slate-500 shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Category score strip (always visible) */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-2">
        {(
          [
            { key: "technicalFit", label: "Technical", short: "Tech" },
            { key: "experienceLevel", label: "Experience", short: "Exp" },
            { key: "education", label: "Education", short: "Edu" },
            { key: "softSkills", label: "Soft Skills", short: "Soft" },
          ] as const
        ).map(({ key, label }) => {
          const cat = categories[key];
          return (
            <div key={key} className="rounded-lg bg-slate-700/40 p-2 text-center">
              <p className={cn("text-lg font-bold tabular-nums", scoreColor(cat.score))}>
                {cat.score}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-700/50 px-4 py-4 space-y-5">
          {/* Summary */}
          <p className="text-sm text-slate-300 leading-relaxed">{candidate.summary}</p>

          {/* Category breakdown */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Score Breakdown
            </p>
            <ScoreBar
              label="Technical Fit"
              score={categories.technicalFit.score}
              justification={categories.technicalFit.justification}
              weight="40%"
            />
            <ScoreBar
              label="Experience Level"
              score={categories.experienceLevel.score}
              justification={categories.experienceLevel.justification}
              weight="30%"
            />
            <ScoreBar
              label="Education"
              score={categories.education.score}
              justification={categories.education.justification}
              weight="15%"
            />
            <ScoreBar
              label="Soft Skills"
              score={categories.softSkills.score}
              justification={categories.softSkills.justification}
              weight="15%"
            />
          </div>

          {/* Strengths & gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {candidate.topStrengths.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
                  <Award className="h-3 w-3" /> Top Strengths
                </p>
                <ul className="space-y-1">
                  {candidate.topStrengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2">
                      <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.gaps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3" /> Notable Gaps
                </p>
                <ul className="space-y-1">
                  {candidate.gaps.map((g, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
