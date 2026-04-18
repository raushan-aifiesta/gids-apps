"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface Props {
  jobTitle: string;
  score: number;
}

export function ShareButton({ jobTitle, score }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = `Will AI take my job as a ${jobTitle}? Automation risk score: ${score}%. Find out yours at ${window.location.origin}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Will AI Take My Job?",
          text,
          url: window.location.origin,
        });
        return;
      } catch {
        // fallthrough to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
