"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { QuestionPrefill, UserContext } from "@/lib/types";

interface Props {
  prefill: QuestionPrefill;
  onSubmit: (ctx: UserContext) => void;
}

interface Question {
  key: keyof UserContext;
  label: string;
  info: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: Question[] = [
  {
    key: "city",
    label: "Current city",
    info: "Salary bands vary by up to 40% between metros and Tier-2 cities.",
    options: [
      { label: "Bengaluru", value: "Bengaluru" },
      { label: "Hyderabad", value: "Hyderabad" },
      { label: "Mumbai", value: "Mumbai" },
      { label: "Delhi/NCR", value: "Delhi/NCR" },
      { label: "Pune", value: "Pune" },
      { label: "Chennai", value: "Chennai" },
      { label: "Kolkata", value: "Kolkata" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    key: "job_function",
    label: "Job function",
    info: "Same experience level pays very differently across functions — e.g. Data/AI roles command a premium over IT services.",
    options: [
      { label: "Engineering/Tech", value: "Engineering/Tech" },
      { label: "Data / AI / ML", value: "Data/AI/ML" },
      { label: "Product Management", value: "Product Management" },
      { label: "Sales / BD", value: "Sales/BD" },
      { label: "Marketing", value: "Marketing" },
      { label: "Design", value: "Design" },
      { label: "Finance", value: "Finance" },
      { label: "Operations / HR", value: "Operations/HR" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    key: "industry",
    label: "Industry sector",
    info: "The same role in Product/SaaS can pay 30–60% more than in IT Services.",
    options: [
      { label: "Product / SaaS", value: "Product/SaaS" },
      { label: "IT Services / Outsourcing", value: "IT Services/Outsourcing" },
      { label: "Fintech / BFSI", value: "Fintech/BFSI" },
      { label: "E-commerce / D2C", value: "E-commerce/D2C" },
      { label: "Healthcare / Pharma", value: "Healthcare/Pharma" },
      { label: "EdTech", value: "EdTech" },
      { label: "Consulting", value: "Consulting" },
      { label: "Media / Gaming", value: "Media/Gaming" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    key: "company_type",
    label: "Company type",
    info: "Company tier is one of the strongest salary signals — FAANG/top product companies pay 2–3x service firms.",
    options: [
      { label: "MNC / Large Corp (1000+)", value: "MNC/Large Corp (1000+)" },
      { label: "Mid-size (100–1000)", value: "Mid-size (100–1000)" },
      { label: "Startup (Series A+)", value: "Startup (Series A+)" },
      { label: "Early-stage (<Series A)", value: "Early-stage Startup (<Series A)" },
      { label: "Indian Conglomerate", value: "Indian Conglomerate" },
      { label: "Government / PSU", value: "Government/PSU" },
    ],
  },
  {
    key: "years_experience",
    label: "Years of experience",
    info: "Confirm your total work experience so the estimate uses the right salary bracket.",
    options: [
      { label: "0–1 years", value: "0" },
      { label: "2–3 years", value: "2" },
      { label: "4–6 years", value: "4" },
      { label: "7–10 years", value: "7" },
      { label: "11–15 years", value: "11" },
      { label: "15+ years", value: "15" },
    ],
  },
  {
    key: "education",
    label: "Highest education",
    info: "Premium employers weight degree and institution — particularly for management and senior roles.",
    options: [
      { label: "B.Tech / B.E.", value: "B.Tech/B.E." },
      { label: "MBA / PGDM", value: "MBA/PGDM" },
      { label: "M.Tech / MS", value: "M.Tech/MS" },
      { label: "PhD", value: "PhD" },
      { label: "Bachelor's (non-eng)", value: "Bachelor's (non-eng)" },
      { label: "Diploma / Polytechnic", value: "Diploma/Polytechnic" },
      { label: "High School or below", value: "High School or below" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    key: "open_to_relocation",
    label: "Open to relocation?",
    info: "Metro rates apply only if you can target those markets — this affects your realistic ceiling.",
    options: [
      { label: "Yes — any city", value: "yes_any" },
      { label: "Only same city/area", value: "same_city" },
      { label: "Not looking to relocate", value: "no" },
    ],
  },
  {
    key: "current_salary_lpa",
    label: "Current salary (₹ LPA)",
    info: "Helps determine if you're underpaid, fairly paid, or above market for your profile.",
    options: [
      { label: "< ₹5L", value: "< 5" },
      { label: "₹5–10L", value: "5–10" },
      { label: "₹10–15L", value: "10–15" },
      { label: "₹15–20L", value: "15–20" },
      { label: "₹20–30L", value: "20–30" },
      { label: "₹30–50L", value: "30–50" },
      { label: "₹50L+", value: "50+" },
    ],
  },
];


function InfoIcon({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors flex items-center justify-center text-[10px] font-bold leading-none select-none"
        aria-label="More info"
      >
        i
      </button>
      {visible && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-52 bg-gray-900 text-gray-200 text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

export function SalaryQuestionsForm({ prefill, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Partial<Record<keyof UserContext, string>>>(prefill);

  function select(key: keyof UserContext, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const ctx: UserContext = {
      ...(answers.city && { city: answers.city }),
      ...(answers.job_function && { job_function: answers.job_function }),
      ...(answers.industry && { industry: answers.industry }),
      ...(answers.company_type && { company_type: answers.company_type }),
      ...(answers.years_experience && { years_experience: parseInt(answers.years_experience, 10) }),
      ...(answers.education && { education: answers.education }),
      ...(answers.open_to_relocation && { open_to_relocation: answers.open_to_relocation as UserContext["open_to_relocation"] }),
      ...(answers.current_salary_lpa && { current_salary_lpa: answers.current_salary_lpa }),
    };
    onSubmit(ctx);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">A few quick questions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Help us calibrate your estimate — pre-filled where we could from your resume.
        </p>
      </div>

      <div className="space-y-6">
        {QUESTIONS.map((q) => (
          <div key={q.key}>
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{q.label}</span>
              <InfoIcon text={q.info} />
            </div>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => select(q.key, opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selected
                        ? "bg-blue-600 border-blue-600 text-white font-medium shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl font-semibold text-base transition-all bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md"
        >
          Get My Salary →
        </button>
      </div>
    </motion.div>
  );
}
