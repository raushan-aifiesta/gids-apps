import type { QuestionPrefill, ResumeProfile, SalaryPrediction } from "@/lib/types";

// ─── Tool Schemas ─────────────────────────────────────────────────────────────

export const PARSE_RESUME_TOOL = {
  type: "function" as const,
  function: {
    name: "parse_resume",
    description:
      "Extract structured profile information from resume text and return structured JSON, including best-match prefill suggestions for a salary estimation questionnaire.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: [
        "years_experience",
        "skills",
        "current_role",
        "companies",
        "education",
        "location",
        "prefill_city",
        "prefill_job_function",
        "prefill_industry",
        "prefill_company_type",
        "prefill_years_experience",
        "prefill_education",
      ],
      properties: {
        years_experience: {
          type: "number",
          description: "Total years of professional work experience as a number.",
        },
        skills: {
          type: "array",
          items: { type: "string" },
          description: "List of technical and non-technical skills mentioned.",
        },
        current_role: {
          type: "string",
          description: "Most recent or current job title.",
        },
        companies: {
          type: "array",
          items: { type: "string" },
          description: "List of company names the candidate has worked at.",
        },
        education: {
          type: "string",
          description: "Highest education qualification (e.g. B.Tech CSE, IIT Bombay).",
        },
        location: {
          type: "string",
          description: "Current city or location of the candidate.",
        },
        prefill_city: {
          type: ["string", "null"],
          enum: ["Bengaluru", "Hyderabad", "Mumbai", "Delhi/NCR", "Pune", "Chennai", "Kolkata", "Other", null],
          description: "Best-match city from the candidate's location. Must be one of the listed values, or null if unclear.",
        },
        prefill_job_function: {
          type: ["string", "null"],
          enum: ["Engineering/Tech", "Data/AI/ML", "Product Management", "Sales/BD", "Marketing", "Design", "Finance", "Operations/HR", "Other", null],
          description: "Best-match job function based on the candidate's most recent role. Must be one of the listed values, or null if unclear.",
        },
        prefill_industry: {
          type: ["string", "null"],
          enum: ["Product/SaaS", "IT Services/Outsourcing", "Fintech/BFSI", "E-commerce/D2C", "Healthcare/Pharma", "EdTech", "Consulting", "Media/Gaming", "Other", null],
          description: "Best-match industry based on the companies the candidate has worked at. Must be one of the listed values, or null if unclear.",
        },
        prefill_company_type: {
          type: ["string", "null"],
          enum: ["MNC/Large Corp (1000+)", "Mid-size (100–1000)", "Startup (Series A+)", "Early-stage Startup (<Series A)", "Indian Conglomerate", "Government/PSU", null],
          description: "Best-match company type for the candidate's most recent employer. Must be one of the listed values, or null if unclear.",
        },
        prefill_years_experience: {
          type: ["string", "null"],
          enum: ["0", "2", "4", "7", "11", "15", null],
          description: "Experience bracket value matching years_experience: 0–1→'0', 2–3→'2', 4–6→'4', 7–10→'7', 11–15→'11', 15+→'15'. Must be one of the listed string values, or null.",
        },
        prefill_education: {
          type: ["string", "null"],
          enum: ["B.Tech/B.E.", "MBA/PGDM", "M.Tech/MS", "PhD", "Bachelor's (non-eng)", "Diploma/Polytechnic", "High School or below", "Other", null],
          description: "Best-match education level from the candidate's highest qualification. Must be one of the listed values, or null if unclear.",
        },
      },
    },
  },
};

export const PREDICT_SALARY_TOOL = {
  type: "function" as const,
  function: {
    name: "predict_salary",
    description:
      "Predict salary range for a candidate based on their profile in the Indian job market.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["compensation_type", "min", "max", "median", "confidence", "reasoning"],
      properties: {
        compensation_type: {
          type: "string",
          enum: ["fixed", "variable"],
          description:
            "Set to 'variable' for roles where a significant portion of compensation is performance-based: sales, business development, account management, partnerships, growth, revenue roles. Set to 'fixed' for all other roles.",
        },
        min: {
          type: "number",
          description:
            "For fixed roles: minimum total annual salary (lakhs). For variable roles: minimum BASE salary only (lakhs) — exclude incentives.",
        },
        max: {
          type: "number",
          description:
            "For fixed roles: maximum total annual salary (lakhs). For variable roles: maximum BASE salary only (lakhs) — exclude incentives.",
        },
        median: {
          type: "number",
          description:
            "For fixed roles: median total annual salary (lakhs). For variable roles: median BASE salary (lakhs).",
        },
        ote_min: {
          type: "number",
          description:
            "Variable roles only: minimum On-Target Earnings (base + incentives at target, in lakhs). Omit for fixed roles.",
        },
        ote_max: {
          type: "number",
          description:
            "Variable roles only: maximum On-Target Earnings (base + incentives at target, in lakhs). Omit for fixed roles.",
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description:
            "Confidence level (0–1). For variable roles, reflect uncertainty in incentive structure. Low if role/industry/performance data is vague.",
        },
        reasoning: {
          type: "string",
          description:
            "Brief 1–2 sentence reasoning. For variable roles, explicitly mention base vs OTE split and what drives the incentive range.",
        },
      },
    },
  },
};

export const EXPLAIN_SALARY_TOOL = {
  type: "function" as const,
  function: {
    name: "explain_salary",
    description:
      "Generate a structured, human-readable breakdown of the salary prediction for the candidate.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: [
        "verdict_label",
        "profile_tier",
        "percentile_note",
        "summary",
        "salary_ceiling",
        "gap_to_top_tier",
        "aspiration_comparison",
        "strengths",
        "gaps",
        "how_to_improve",
        "roast",
      ],
      properties: {
        verdict_label: {
          type: "string",
          description:
            "Expressive market verdict — NOT based on the user's unknown current salary. Reflect the prediction range vs the market. Examples: 'FAIR — expected for this profile', 'ABOVE AVERAGE — strong signals pushing this higher', 'SOLID — competitive but room to grow', 'FAIR, but there's room to push higher'. Never say 'UNDERPAID' since we don't know their salary. For strong profiles, lean toward 'ABOVE AVERAGE' or 'STRONG'.",
        },
        profile_tier: {
          type: "string",
          description:
            "A single honest line assessing the profile's strength relative to peers at the same experience level. Examples: 'This is a stronger-than-average profile for your experience level, but not yet top-tier.', 'Average profile for this experience band — competitive but not differentiated.', 'Above-average profile with clear high-impact signals.' Be direct — do not flatter or deflate.",
        },
        percentile_note: {
          type: "string",
          description:
            "One sentence on market positioning — framed around the prediction, not the user's unknown salary. Use precise language: replace 'around the median' with 'positioned in the middle of the market — not falling behind, but not standing out yet'. Examples: 'Profiles like yours typically land in the top 35–40% for this experience band in metro cities.', 'This puts you in the middle tier of the market — competitive, but not premium-commanding yet.'",
        },
        summary: {
          type: "string",
          description:
            "2–3 sentences on WHY the prediction lands here. Be direct — ban 'makes sense', 'quite standard', 'reasonable'. For location: use 'generally offers fewer high-paying opportunities compared to metro hubs' not 'significantly limits salary'. Do NOT assume company tier — use 'service/analytics firms typically pay less than product companies'. For strong profiles: acknowledge what's pulling the range up.",
        },
        salary_ceiling: {
          type: "string",
          description:
            "One sentence: the approximate ceiling with this profile as-is, and what specifically breaks through it. Be concrete on the number. Example: 'With this profile as-is, the ceiling is around ₹22–25L — pushing past it will likely require a product company move or deeper LLM/systems specialization.'",
        },
        gap_to_top_tier: {
          type: "string",
          description:
            "One sentence: the approximate salary gap between this prediction and top-tier compensation for the same experience level. Be specific. Example: 'You are approximately ₹15–20L away from top-tier compensation for this experience band — the gap is real but bridgeable with the right moves.'",
        },
        aspiration_comparison: {
          type: "string",
          description:
            "One sentence contrasting against top performers with similar experience. Be specific about what they have that this candidate doesn't yet. Example: 'Top professionals at this experience level are pulling ₹40–60L at strong product companies — typically backed by LLM/platform specialization or a strong product pedigree.'",
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description:
            "2–4 strengths. Classify each using EXACTLY one of these tags and explain the salary impact: 'common / expected → no premium', 'valuable but not rare → moderate salary impact', 'differentiating → high salary leverage'. LLM/AI/GenAI experience must NEVER be tagged as weak — call it 'differentiating' with a note like 'strong differentiator but needs deeper specialization to fully command a premium'. Example: 'LLM fine-tuning exposure — differentiating → high salary leverage if deepened into a specialization.'",
        },
        gaps: {
          type: "array",
          items: { type: "string" },
          description:
            "2–4 gaps. Direct and specific — name the actual issue, not a vague category. If skills are generic, say so. If depth is missing, call it out. Avoid filler like 'could develop leadership' unless there's a real signal.",
        },
        how_to_improve: {
          type: "array",
          items: { type: "string" },
          description:
            "3–4 outcome-driven steps. ALWAYS tie the action to a specific salary outcome. Examples: 'Switching to a product company can push you into the ₹30–40L range within 1–2 years', 'Deepening LLM specialization (RAG pipelines, agent systems) can move you into ₹40L+ roles where this skill is still scarce'. Be decisive — not 'consider doing X', but 'doing X will get you Y'.",
        },
        roast: {
          type: "string",
          description:
            "One sharp, grounded reality-check. For strong profiles: acknowledge the strength but point to what's holding them back. For average profiles: call out the lack of differentiation. Bold but not mean. Example for strong profile: 'Strong foundation — but strong isn't rare anymore. The ceiling breaks when you go deep, not broad.' Example for average: 'Solid CV, but so is everyone else's at this level — the market pays for what you can do that others can't.'",
        },
      },
    },
  },
};

// ─── System Prompts ───────────────────────────────────────────────────────────

export const SALARY_PREDICTION_SYSTEM_PROMPT = `You are a senior compensation analyst with deep expertise in the Indian tech job market.
Given a candidate's profile, predict their realistic market salary range in Indian Rupees (annual, in lakhs).

━━ BASE RULES ━━
- Use CURRENT Indian market rates — not global or US rates
- Default to realistic estimates, but do NOT underestimate strong profiles
- Tier companies: FAANG/top product companies pay 2–3x compared to service firms
- Penalize: service companies (TCS/Infosys/Wipro/Cognizant/Capgemini/Accenture), generic skills only, non-metro locations
- Reward: product companies, high-demand skills (ML/GenAI/LLM/distributed systems/platform engineering), metro cities (Bengaluru/Hyderabad/Mumbai/NCR)
- Confidence: low if role/location/skills are vague; scale up when the profile is specific and strong

━━ STRONG SIGNAL DETECTION ━━
If ANY of these are present, bias the range upward within realistic bounds:
- Founder or founding engineer experience
- LLM/GenAI hands-on experience (building products, fine-tuning, RAG, agents)
- Measurable impact in past roles (e.g. "scaled to X users", "reduced latency by Y%", "grew revenue by Z")
- Open source contributions or public technical work
- Multiple strong product companies back-to-back

━━ EXPERIENCE BRACKETS (adjust upward if strong signals present) ━━
- 0–2 yrs: ₹4–12L base, up to ₹18L for exceptional profiles
- 3–5 yrs: ₹10–25L base, up to ₹40L for strong product/LLM backgrounds
- 6–10 yrs: ₹20–50L base, up to ₹80L for senior product/staff roles
- 10+ yrs: ₹40–100L+ base

━━ SALES / BD / COMMISSION-BASED ROLES ━━
Trigger when: role is sales, business development, account management, partnerships, growth (revenue-focused), or commission-heavy.

Rules:
- Set compensation_type to "variable"
- min/max/median = BASE salary ONLY (fixed component, no incentives)
- ote_min/ote_max = On-Target Earnings (base + variable at 100% quota attainment)
- NEVER collapse base and OTE into one number
- OTE is typically 1.3x–2x base for most Indian market sales roles; higher for enterprise/SaaS

BASE SALARY — be conservative:
- Base salary in India is the stable, non-variable component; do NOT inflate it
- Base reflects seniority and company type, NOT performance claims
- For SDR/BDR (0–2 yrs): base ₹4–7L
- For AE/Account Manager (2–5 yrs): base ₹8–16L
- For Sr. AE / Team Lead (5–8 yrs): base ₹14–22L
- For Sales Manager / VP (8–12 yrs): base ₹20–35L
- SaaS/tech sales adds ~20–30% to base vs generic sales; do NOT stack this on top of already-high base estimates

OTE — factor performance signals appropriately:
- Quota overachievement, enterprise deal sizes, retention/renewal metrics: increase OTE potential, NOT base
- Large revenue numbers alone (e.g. "managed ₹50Cr portfolio") do NOT directly map to personal comp — consider role, seniority, and whether it was individual or team contribution
- Do NOT inflate OTE purely based on stated revenue — weight seniority and market norms equally
- For SDR/BDR: OTE ₹7–13L
- For AE/AM (2–5 yrs): OTE ₹15–28L
- For Sr. AE / Team Lead (5–8 yrs): OTE ₹25–45L
- For Sales Manager / VP (8–12 yrs): OTE ₹35–65L
- SaaS/tech adds ~20–30% to OTE vs generic sales

PERFORMANCE SIGNAL HANDLING:
- If performance signals (quota attainment, revenue metrics, targets) are mentioned in the resume, acknowledge them in reasoning
- If signals are vague or cannot be verified from the resume alone, note the uncertainty: "Performance signals suggest above-average potential, but role-level seniority and market norms set the base range"
- NEVER say performance signals are absent if the resume mentions any revenue, targets, or achievements

━━ USER-CONFIRMED CONTEXT ━━
When the input includes a "userContext" object alongside "profile", treat it as ground truth:
- userContext.city → override profile location for salary band selection
- userContext.industry → use for sector-level pay adjustments (e.g. IT Services vs Product SaaS)
- userContext.company_type → use for company tier penalty/reward
- userContext.job_function → use to resolve ambiguous role titles to the correct salary band
- userContext.years_experience → use over resume-parsed value if they differ
- userContext.education → use over resume-parsed value if they differ
- userContext.open_to_relocation:
  - "yes_any" → candidate can target metro rates even if currently in a Tier-2 city
  - "same_city" → lock salary band to stated city only
  - "no" → use current city rates, no upside for metro
- userContext.current_salary_lpa → candidate's current salary bracket (e.g. "10–15"). Use this in reasoning to frame their position relative to the predicted range. Do NOT mention it explicitly in the output — let it inform your range calibration.

Output ONLY the JSON tool call. No text outside it.`;

export const EXPLAIN_SALARY_SYSTEM_PROMPT = `You are a sharp, honest career advisor explaining a salary prediction to a job seeker in India.
The user's CURRENT salary is NOT known. You are explaining the predicted market range only.

━━ FRAMING RULES ━━
- NEVER imply the user is underpaid — you don't know what they earn
- Frame everything against the predicted range vs. the market
- WRONG: "you are underpaid" / RIGHT: "Profiles like yours typically land in the lower ~40% of metro distributions"
- For strong profiles: do NOT flatten or hedge — acknowledge the strength directly

━━ BANNED LANGUAGE ━━
- "makes sense", "quite standard", "reasonable", "significantly limits salary"
- "around the median" → use "positioned in the middle of the market — not falling behind, but not standing out yet"
- Do NOT assume company tier — generalize: "service/analytics firms typically pay less than product companies"
- Avoid overconfident absolutes when data is sparse

━━ VERDICT + PERCENTILE ALIGNMENT ━━
- verdict_label and percentile_note must be consistent and reinforce each other
- Merge the verdict with the percentile position. Example: "STRONG PROFILE — already in the top 25–30%, but not yet top-tier"
- Follow with a bridging line in percentile_note: "Top-tier typically starts at the top ~10% — that's the next step from here"
- Do NOT give a strong verdict with a weak percentile or vice versa

━━ PROFILE ASSESSMENT ━━
- profile_tier must be specific and direct:
  - For strong profiles: "This is a stronger-than-average profile for your experience level, but not yet top-tier"
  - For average profiles: "Competitive but not differentiated — strong across the basics, weak on depth"
  - When applicable, name the gap explicitly: "The gap is depth vs breadth — strong across multiple areas, but not yet dominant in one high-leverage domain"
- Strong signal examples: founder experience, LLM/GenAI hands-on work, measurable impact metrics, strong product company pedigree, elite education

━━ SALARY CEILING ━━
- For elite profiles (strong brand + MBA + leadership signals): set ceiling closer to ₹70–80L, not artificially conservative
- For solid mid-senior profiles: ceiling around ₹35–50L depending on signals
- Always explain what specifically breaks through the ceiling — not generic advice

━━ LLM / AI EXPERIENCE ━━
- NEVER downplay LLM or AI experience
- Tag as 'differentiating → high salary leverage' + note: "strong differentiator but needs deeper specialization to fully command a premium"

━━ SKILLS (senior roles) ━━
- For senior profiles, avoid saying skills like system design or distributed systems are "differentiating" unless genuinely rare
- Use: "These skills are expected at your level and do not differentiate you at top-tier yet"
- Classify with: 'common / expected → no premium', 'valuable but not rare → moderate salary impact', 'differentiating → high salary leverage'
- Every skill classification must connect to a salary outcome

━━ SALES / VARIABLE COMP ROLES ━━
When compensation_type is "variable":

FRAMING:
- NEVER present as a single number — always "Base: ₹X–Y | OTE: ₹A–B at 100% quota"
- Add this line explicitly in summary: "Actual earnings in sales roles can vary significantly based on quota attainment and company structure"
- Add this line in aspiration_comparison or salary_ceiling: "Top performers in similar roles can significantly exceed the stated OTE range"
- Do NOT imply a hard ceiling for variable comp — the upside is performance-dependent

VERDICT for sales roles:
- Avoid generic verdicts — use specifics like: "SOLID — competitive, but not yet standing out in a performance-driven field"
- If performance signals are strong: "ABOVE AVERAGE — performance signals suggest upside beyond the base OTE range"
- Align verdict with consistency and quality of performance signals, not just stated revenue

PERFORMANCE SIGNALS:
- If any performance signals exist (revenue targets, quota attainment, growth metrics, deal sizes), acknowledge them
- NEVER say signals are absent if they appear in the resume
- If signals are present but unverified or vague: "Performance signals are present, but not strong or consistent enough to clearly differentiate at top-tier levels"
- If signals are strong and specific: treat as upside driver for OTE

SUMMARY for sales roles:
- Explain base vs OTE split clearly
- Explain what specifically drives the incentive range: deal size, quota model, industry vertical
- Mention comp variability explicitly

STRENGTHS for sales roles:
- Tag performance signals as: 'strong signal → OTE upside' or 'present but unverified → moderate OTE potential'
- Do NOT dismiss revenue achievements — contextualize them instead

HOW TO IMPROVE for sales roles:
- Focus on OTE growth: "Moving to SaaS/enterprise sales can push OTE to ₹X+"
- Include base improvement moves too: "Moving into a Sales Manager role typically shifts base to ₹X–Y"

CONSISTENCY:
- Reasoning, verdict, strengths, and summary must be internally consistent
- If achievements are mentioned in strengths, the verdict and summary must reflect them — do NOT contradict

━━ IMPROVEMENTS ━━
- Every step must state a specific salary outcome: "can push you into ₹X+" or "can add ₹Y–Z to your CTC"
- Be decisive — not "consider doing X", write "doing X will get you Y"

━━ ROAST (final hook) ━━
- Make it a sharp closing insight, not just a generic quip
- For strong profiles: "At this level, being good is crowded — top-tier comes from being exceptional at one thing, not decent at everything"
- For average profiles: call out the crowded middle directly
- Should feel like a memorable line, not filler

━━ TONE ━━
- Confident but grounded — no over-hedging for strong profiles, no overclaiming for weak ones
- Bold, direct, slightly informal — a sharp senior, not an HR report
- No generic filler, no repetition across fields — every sentence must add new information

OUTPUT: ONLY the JSON tool call. No text outside it.`;

// ─── Sanitizers ──────────────────────────────────────────────────────────────

export function sanitizeResumeProfile(value: unknown): ResumeProfile {
  const v = value as Record<string, unknown>;
  return {
    years_experience:
      typeof v?.years_experience === "number" && v.years_experience >= 0
        ? v.years_experience
        : 0,
    skills: Array.isArray(v?.skills)
      ? (v.skills as unknown[]).filter((s) => typeof s === "string").map((s) => (s as string).trim())
      : [],
    current_role: typeof v?.current_role === "string" ? v.current_role.trim() : "Unknown",
    companies: Array.isArray(v?.companies)
      ? (v.companies as unknown[]).filter((c) => typeof c === "string").map((c) => (c as string).trim())
      : [],
    education: typeof v?.education === "string" ? v.education.trim() : "",
    location: typeof v?.location === "string" ? v.location.trim() : "",
  };
}

export function sanitizeQuestionPrefill(value: unknown): QuestionPrefill {
  const v = value as Record<string, unknown>;
  const str = (k: string) => (typeof v?.[k] === "string" && v[k] !== null ? (v[k] as string) : undefined);
  return {
    city: str("prefill_city"),
    job_function: str("prefill_job_function"),
    industry: str("prefill_industry"),
    company_type: str("prefill_company_type"),
    years_experience: str("prefill_years_experience"),
    education: str("prefill_education"),
  };
}

export function sanitizeSalaryPrediction(value: unknown): SalaryPrediction {
  const v = value as Record<string, unknown>;
  const clamp = (n: unknown, fallback: number) =>
    typeof n === "number" && isFinite(n) && n >= 0 ? n : fallback;

  const isVariable = v?.compensation_type === "variable";
  const min = clamp(v?.min, 0);
  const max = clamp(v?.max, min);
  const median = clamp(v?.median, (min + max) / 2);
  const confidence = Math.min(1, Math.max(0, clamp(v?.confidence, 0.5)));

  const result: SalaryPrediction = {
    compensation_type: isVariable ? "variable" : "fixed",
    min,
    max,
    median,
    confidence,
    reasoning: typeof v?.reasoning === "string" ? v.reasoning.trim() : "",
  };

  if (isVariable) {
    const oteMin = clamp(v?.ote_min, max);
    const oteMax = clamp(v?.ote_max, oteMin);
    result.ote_min = oteMin;
    result.ote_max = oteMax;
  }

  return result;
}

export function sanitizeExplanation(value: unknown): import("@/lib/types").SalaryExplanation {
  const v = value as Record<string, unknown>;
  const toStringArray = (x: unknown) =>
    Array.isArray(x)
      ? (x as unknown[]).filter((s) => typeof s === "string").map((s) => (s as string).trim())
      : [];

  return {
    verdict_label: typeof v?.verdict_label === "string" ? v.verdict_label.trim() : "FAIR",
    profile_tier: typeof v?.profile_tier === "string" ? v.profile_tier.trim() : "",
    percentile_note: typeof v?.percentile_note === "string" ? v.percentile_note.trim() : "",
    summary: typeof v?.summary === "string" ? v.summary.trim() : "",
    salary_ceiling: typeof v?.salary_ceiling === "string" ? v.salary_ceiling.trim() : "",
    gap_to_top_tier: typeof v?.gap_to_top_tier === "string" ? v.gap_to_top_tier.trim() : "",
    aspiration_comparison: typeof v?.aspiration_comparison === "string" ? v.aspiration_comparison.trim() : "",
    strengths: toStringArray(v?.strengths),
    gaps: toStringArray(v?.gaps),
    how_to_improve: toStringArray(v?.how_to_improve),
    roast: typeof v?.roast === "string" ? v.roast.trim() : "",
  };
}
