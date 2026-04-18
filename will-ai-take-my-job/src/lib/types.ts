export interface UpskillStep {
  title: string;
  description: string;
  resources?: string[];
}

export interface JobAnalysis {
  jobTitle: string;
  automationRiskScore: number; // 0–100
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  atRiskTasks: string[];
  safeHumanTasks: string[];
  upskillSteps: UpskillStep[];
  summary: string;
  analysisDate: string;
}

export type AnalysisState =
  | { status: "idle" }
  | { status: "analyzing" }
  | { status: "done"; result: JobAnalysis }
  | { status: "error"; message: string };
