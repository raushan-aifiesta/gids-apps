export interface CategoryScore {
  score: number; // 1–100
  justification: string;
}

export interface CandidateResult {
  fileName: string;
  candidateName: string;
  jobTitle: string;
  totalFit: number; // weighted average 1–100
  categories: {
    technicalFit: CategoryScore;
    experienceLevel: CategoryScore;
    education: CategoryScore;
    softSkills: CategoryScore;
  };
  summary: string;
  topStrengths: string[];
  gaps: string[];
}

export interface ScreeningResponse {
  candidates: CandidateResult[];
  jobTitle: string;
  screenedAt: string;
}

export interface ScreeningError {
  error: string;
  details?: string;
}
