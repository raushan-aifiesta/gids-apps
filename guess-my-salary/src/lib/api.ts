import type { MeshModel, QuestionPrefill, ResumeProfile, SalaryAnalysisResponse, UserContext } from "@/lib/types";
import { apiPath } from "@/lib/basePath";

export async function fetchModels(): Promise<MeshModel[]> {
  const res = await fetch(apiPath("/api/models"));
  if (!res.ok) throw new Error("Failed to fetch models");
  const data = (await res.json()) as unknown[];
  return (Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? []).filter(
    (model): model is MeshModel =>
      Boolean((model as MeshModel)?.id && (model as MeshModel)?.name)
  );
}

export async function parseResume(
  resumeText: string
): Promise<{ profile: ResumeProfile; prefill: QuestionPrefill }> {
  const res = await fetch(apiPath("/api/salary/parse"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });

  const data = (await res.json()) as { profile: ResumeProfile; prefill: QuestionPrefill; error?: string };

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to parse resume.");
  }

  return { profile: data.profile, prefill: data.prefill };
}

export async function analyzeSalary(
  resumeText: string,
  userContext: UserContext,
  profile: ResumeProfile
): Promise<SalaryAnalysisResponse> {
  const res = await fetch(apiPath("/api/salary/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, userContext, profile }),
  });

  const data = (await res.json()) as SalaryAnalysisResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to analyze resume.");
  }

  return data;
}
