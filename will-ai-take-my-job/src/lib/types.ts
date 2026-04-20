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

export interface JobContext {
  workRoutine?: "mostly_same" | "mix" | "mostly_new";
  humanConnection?: "not_much" | "somewhat" | "a_lot";
  creativeJudgment?: "rarely" | "sometimes" | "constantly";
  outputType?: "fully_digital" | "mixed" | "mostly_physical";
}

export type AnalysisState =
  | { status: "idle" }
  | { status: "questions"; jobTitle: string }
  | { status: "analyzing" }
  | { status: "done"; result: JobAnalysis }
  | { status: "error"; message: string };
