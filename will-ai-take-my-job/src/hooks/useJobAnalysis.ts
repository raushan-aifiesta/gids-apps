"use client";

import { useState } from "react";
import type { AnalysisState } from "@/lib/types";
import { analyzeJob } from "@/lib/api";

const RECENT_KEY = "wai_recent_searches";
const MAX_RECENT = 5;

function saveRecentSearch(title: string) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    const next = [title, ...prev.filter((t) => t !== title)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage not available (SSR or private browsing)
  }
}

export function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useJobAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });

  async function analyze(jobTitle: string) {
    const title = jobTitle.trim();
    if (!title) return;

    setState({ status: "analyzing" });

    try {
      const result = await analyzeJob(title);
      saveRecentSearch(result.jobTitle);
      setState({ status: "done", result });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  function reset() {
    setState({ status: "idle" });
  }

  return { state, analyze, reset };
}
