"use client";

interface Props {
  current: number;   // 1-based answered count
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">
          Question {current} of {total}
        </span>
        <span className="text-xs text-slate-500">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full shimmer transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
