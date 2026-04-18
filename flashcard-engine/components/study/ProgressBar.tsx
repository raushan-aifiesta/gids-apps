"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressBarProps {
  reviewed: number;
  total: number;
  correct: number;
  incorrect: number;
}

export function ProgressBar({ reviewed, total, correct, incorrect }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {reviewed} / {total} cards reviewed
        </span>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-green-500 text-green-600">
            ✓ {correct}
          </Badge>
          <Badge variant="outline" className="border-red-400 text-red-500">
            ✗ {incorrect}
          </Badge>
        </div>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
