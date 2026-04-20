"use client";

interface ProgressBarProps {
  reviewed: number;
  total: number;
  correct: number;
  incorrect: number;
}

export function ProgressBar({ reviewed, total, correct, incorrect }: ProgressBarProps) {
  const pct = total > 0 ? (reviewed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Thin animated progress track */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, oklch(0.55 0.22 265), oklch(0.65 0.22 295))",
            boxShadow: pct > 0 ? "0 0 8px oklch(0.55 0.22 265 / 0.6)" : "none",
          }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {reviewed} <span className="text-zinc-600">/</span> {total}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
            {correct}
          </span>
          <span className="flex items-center gap-1 text-red-500/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500/70" />
            {incorrect}
          </span>
        </div>
      </div>
    </div>
  );
}
