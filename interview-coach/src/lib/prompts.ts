import type { InterviewMode } from "./types";

// ─── System prompts ──────────────────────────────────────────────────────────

export function getQuestionSystemPrompt(
  mode: InterviewMode,
  skills: string[],
  role: string,
  totalQuestions: number,
): string {
  const skillsContext =
    skills.length > 0
      ? `The candidate's resume highlights these skills: ${skills.join(", ")}. Prioritise questions around these.`
      : "No resume provided. Ask well-rounded full-stack/software engineering questions.";

  const modeGuidance =
    mode === "roast"
      ? `You are a brutally honest, razor-sharp senior engineer conducting a pressure-test interview. Your questions are direct and unforgiving. You don't soften anything.`
      : `You are a supportive senior engineer who wants to help the candidate grow. Your questions are challenging but framed constructively.`;

  return `${modeGuidance}

You are generating interview questions for a ${role || "software engineer"} candidate in a mock interview session of ${totalQuestions} questions.

${skillsContext}

Rules:
- Each question must be unique and non-repetitive.
- Vary difficulty: ~30% easy, ~50% medium, ~20% hard.
- Cover diverse categories: algorithms, system design, language-specific, debugging, behavioural, architecture.
- Return ONLY valid JSON. No markdown, no preamble.

JSON shape:
{
  "id": "q_<short_uuid>",
  "index": <1-based integer>,
  "text": "<the question>",
  "category": "<category>",
  "difficulty": "easy|medium|hard",
  "expectedTopics": ["<topic1>", "<topic2>"]
}`;
}

export function getEvaluationSystemPrompt(mode: InterviewMode): string {
  const toneGuidance =
    mode === "roast"
      ? `You are a brutally honest senior dev. Be witty, sharp, and savage—but accurate. Add a "roastLine" that stings but lands a real technical point.`
      : `You are a constructive senior dev mentor. Be honest but encouraging. Add an "encouragement" line that highlights genuine progress.`;

  return `${toneGuidance}

Evaluate the candidate's interview answer. Return ONLY valid JSON matching this exact shape:

{
  "score": <1-10 integer>,
  "accuracy": <0-100 integer: how factually/technically correct>,
  "clarity": <0-100 integer: how clearly communicated>,
  "whatYouMissed": ["<concise missed point 1>", "<concise missed point 2>"],
  "strengths": ["<what they got right 1>", "<what they got right 2>"],
  ${mode === "roast" ? `"roastLine": "<one witty savage line>",` : `"encouragement": "<one genuine encouraging line>",`}
  "detailedFeedback": "<2-3 sentence comprehensive paragraph for the full report>"
}

Be precise. Score 1-3 for weak, 4-6 for decent, 7-9 for strong, 10 for exceptional. Don't inflate scores.`;
}

export function getFinalScoreSystemPrompt(mode: InterviewMode): string {
  return `You are calculating a final performance score for a mock interview session.

Given the array of per-question scores and feedback, compute an aggregated final assessment.

Return ONLY valid JSON:
{
  "overall": <1-100 integer>,
  "accuracy": <0-100>,
  "clarity": <0-100>,
  "consistency": <0-100: how steady the performance was across all questions>,
  "rank": "Senior|Mid|Junior|Intern",
  "summary": "<2-3 sentence honest paragraph summarising the session>",
  ${mode === "roast" ? `"roastSummary": "<one final savage but fair closing line>"` : `"roastSummary": null`}
}

Rank mapping: overall >= 80 → Senior, >= 60 → Mid, >= 40 → Junior, < 40 → Intern.`;
}

export function getSkillExtractionPrompt(): string {
  return `Extract the candidate's technical skills from their resume text.

Return ONLY valid JSON:
{
  "skills": ["<skill1>", "<skill2>", ...],
  "role": "<inferred job title, e.g. Full-Stack Engineer>",
  "yearsExperience": <estimated integer or null>
}

Focus on: programming languages, frameworks, databases, cloud platforms, tools. Max 20 skills.`;
}

// ─── JSON extraction helper (same pattern as resume-builder) ────────────────
export function extractJSON<T>(content: string): T {
  const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const raw = jsonMatch ? jsonMatch[1] : content.trim();
  return JSON.parse(raw) as T;
}
