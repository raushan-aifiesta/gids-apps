"use client";

interface UploadSkeletonProps {
  label: string;
}

export function UploadSkeleton({ label }: UploadSkeletonProps) {
  return (
    <div className="flex flex-col items-center gap-7 py-10">
      {/* Indigo pulse orb */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500/25" />
        <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-indigo-500/15 [animation-delay:0.3s]" />
        <span className="relative inline-flex h-8 w-8 rounded-full bg-indigo-500/70 shadow-[0_0_20px_oklch(0.55_0.22_265/0.5)]" />
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-zinc-400">{label}</p>

      {/* Shimmer skeleton lines */}
      <div className="w-full max-w-xs space-y-3">
        {[100, 83, 67].map((widthPct, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full overflow-hidden"
            style={{ width: `${widthPct}%` }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.17 0 0) 0%, oklch(0.22 0.02 265) 50%, oklch(0.17 0 0) 100%)",
                backgroundSize: "200% 100%",
                animation: `shimmer 1.8s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
