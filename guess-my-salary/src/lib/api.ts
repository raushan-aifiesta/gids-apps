import type { MeshModel, SalaryAnalysisResponse } from "@/lib/types";
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

export async function analyzeSalary(resumeText: string): Promise<SalaryAnalysisResponse> {
  const res = await fetch(apiPath("/api/salary/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText }),
  });

  const data = (await res.json()) as SalaryAnalysisResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to analyze resume.");
  }

  return data;
}
