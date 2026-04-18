import type { JobAnalysis } from "./types";
import { apiPath } from "./basePath";

export async function analyzeJob(jobTitle: string): Promise<JobAnalysis> {
  const res = await fetch(apiPath("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).error ?? "Analysis failed");
  }

  return res.json() as Promise<JobAnalysis>;
}
