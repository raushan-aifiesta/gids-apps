import type { JobAnalysis, UpskillStep } from "./types";

export const LABOR_MARKET_ANALYST_SYSTEM_PROMPT = `You are a Labor Market Analyst and Future of Work Expert with deep expertise in AI automation trends, labor economics, and workforce transformation.

Your task: analyze any job title and produce a rigorous, data-grounded assessment of automation risk in the next 5–10 years, based on current AI capabilities and trajectory.

You MUST return a single valid JSON object. No markdown, no code fences, no explanatory text outside the JSON.

JSON shape:
{
  "jobTitle": "string (canonical form of the provided job title)",
  "automationRiskScore": number (integer 0–100, where 0 = fully safe, 100 = fully automatable today),
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "atRiskTasks": ["string"] (3–6 specific tasks within this role that AI can already or soon fully perform),
  "safeHumanTasks": ["string"] (3–6 specific tasks that require human judgment, ethics, creativity, or embodiment and resist automation),
  "upskillSteps": [
    {
      "title": "string (concise action label, e.g. 'Learn Prompt Engineering')",
      "description": "string (1–2 sentences: what to do and why it future-proofs this role)",
      "resources": ["string"] (1–3 specific course names, certifications, or tools — optional but preferred)
    }
  ],
  "summary": "string (2–3 sentence executive summary: overall automation outlook, key risk driver, and most important protective action)",
  "analysisDate": "string (today's date in ISO 8601 format, e.g. '2026-04-17')"
}

Scoring rules:
- riskLevel MUST align with automationRiskScore: Low = 0–30, Medium = 31–60, High = 61–80, Critical = 81–100
- atRiskTasks and safeHumanTasks must be specific to THIS job title — no generic filler
- Provide exactly 3 upskillSteps, ordered from most impactful to least
- The JSON must be parseable by JSON.parse() with no modifications

Return ONLY the JSON object.`;

export function sanitizeJobAnalysis(raw: unknown): JobAnalysis {
  const r = (raw ?? {}) as Record<string, unknown>;

  const score =
    typeof r.automationRiskScore === "number"
      ? Math.min(100, Math.max(0, Math.round(r.automationRiskScore)))
      : 50;

  const validLevels = ["Low", "Medium", "High", "Critical"] as const;
  const derivedLevel: JobAnalysis["riskLevel"] =
    score <= 30 ? "Low" : score <= 60 ? "Medium" : score <= 80 ? "High" : "Critical";
  const riskLevel = validLevels.includes(r.riskLevel as (typeof validLevels)[number])
    ? (r.riskLevel as JobAnalysis["riskLevel"])
    : derivedLevel;

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((s) => typeof s === "string").map(String) : [];

  const upskillSteps: UpskillStep[] = Array.isArray(r.upskillSteps)
    ? (r.upskillSteps as unknown[]).map((step) => {
        const s = (step ?? {}) as Record<string, unknown>;
        return {
          title: String(s.title ?? ""),
          description: String(s.description ?? ""),
          resources: Array.isArray(s.resources) ? s.resources.map(String) : undefined,
        };
      })
    : [];

  return {
    jobTitle: String(r.jobTitle ?? "Unknown Role"),
    automationRiskScore: score,
    riskLevel,
    atRiskTasks: toStringArray(r.atRiskTasks),
    safeHumanTasks: toStringArray(r.safeHumanTasks),
    upskillSteps,
    summary: String(r.summary ?? ""),
    analysisDate:
      typeof r.analysisDate === "string"
        ? r.analysisDate
        : new Date().toISOString().split("T")[0],
  };
}
