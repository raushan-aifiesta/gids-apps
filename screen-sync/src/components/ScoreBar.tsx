"use client";

import { cn, scoreBarColor } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  justification?: string;
  weight?: string;
}

export function ScoreBar({ label, score, justification, weight }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          {weight && (
            <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              {weight}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-white tabular-nums">{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-700/60">
        <div
          className={cn("h-full rounded-full transition-all duration-700", scoreBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      {justification && (
        <p className="text-xs text-slate-400 leading-relaxed">{justification}</p>
      )}
    </div>
  );
}
