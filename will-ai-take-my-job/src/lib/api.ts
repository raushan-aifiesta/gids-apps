import type { JobAnalysis, JobContext } from "./types";
import { apiPath } from "./basePath";

export async function analyzeJob(jobTitle: string, context?: JobContext): Promise<JobAnalysis> {
  const res = await fetch(apiPath("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).error ?? "Analysis failed");
  }

  return res.json() as Promise<JobAnalysis>;
}
