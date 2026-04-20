export interface MeshModel {
  id: string;
  name: string;
  context_length: number | null;
  is_free: boolean;
  description: string | null;
  pricing: ModelPricing | null;
}

export interface ModelPricing {
  prompt_usd_per_1k: string | null;
  completion_usd_per_1k: string | null;
}

export interface ResumeProfile {
  years_experience: number;
  skills: string[];
  current_role: string;
  companies: string[];
  education: string;
  location: string;
}

export interface SalaryPrediction {
  compensation_type: "fixed" | "variable";
  min: number;
  max: number;
  median: number;
  ote_min?: number; // variable roles only
  ote_max?: number; // variable roles only
  confidence: number; // 0-1
  reasoning: string;
}

export interface SalaryExplanation {
  verdict_label: string;
  profile_tier: string;
  percentile_note: string;
  summary: string;
  salary_ceiling: string;
  gap_to_top_tier: string;
  aspiration_comparison: string;
  strengths: string[];
  gaps: string[];
  how_to_improve: string[];
  roast: string;
}

export interface SalaryAnalysisResponse {
  profile: ResumeProfile;
  prediction: SalaryPrediction;
  explanation: SalaryExplanation;
}

export interface QuestionPrefill {
  city?: string;
  job_function?: string;
  industry?: string;
  company_type?: string;
  years_experience?: string;
  education?: string;
}

export interface UserContext {
  city?: string;
  job_function?: string;
  industry?: string;
  company_type?: string;
  years_experience?: number;
  education?: string;
  open_to_relocation?: "yes_any" | "same_city" | "no";
  current_salary_lpa?: string;
}

export type AnalysisStatus = "idle" | "parsing" | "questions" | "predicting" | "explaining" | "done" | "error";

export type AnalysisState =
  | { status: "idle" }
  | { status: "parsing" }
  | { status: "questions"; resumeText: string; profile: ResumeProfile; prefill: QuestionPrefill }
  | { status: "predicting" }
  | { status: "explaining" }
  | { status: "done"; result: SalaryAnalysisResponse }
  | { status: "error"; message: string };

export type SalaryVerdict = "underpaid" | "fair" | "overpaid";
