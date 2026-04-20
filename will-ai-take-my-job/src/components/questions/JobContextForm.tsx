"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { JobContext } from "@/lib/types";

interface Props {
  jobTitle: string;
  onSubmit: (context: JobContext) => void;
  onBack: () => void;
}

type QuestionKey = keyof JobContext;

const QUESTIONS: {
  key: QuestionKey;
  question: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "workRoutine",
    question: "How much of your daily work follows the same steps or templates?",
    options: [
      { value: "mostly_same", label: "Mostly the same" },
      { value: "mix", label: "A mix" },
      { value: "mostly_new", label: "Mostly new every time" },
    ],
  },
  {
    key: "humanConnection",
    question: "How much does your job depend on in-person human connection, trust, or reading emotions?",
    options: [
      { value: "not_much", label: "Not much" },
      { value: "somewhat", label: "Somewhat" },
      { value: "a_lot", label: "A lot" },
    ],
  },
  {
    key: "creativeJudgment",
    question: "How often does your work require creative judgment or solving problems without a clear playbook?",
    options: [
      { value: "rarely", label: "Rarely" },
      { value: "sometimes", label: "Sometimes" },
      { value: "constantly", label: "Constantly" },
    ],
  },
  {
    key: "outputType",
    question: "Is your output mostly digital or does it require physical presence and hands?",
    options: [
      { value: "fully_digital", label: "Fully digital" },
      { value: "mixed", label: "Mixed" },
      { value: "mostly_physical", label: "Mostly physical" },
    ],
  },
];

export function JobContextForm({ jobTitle, onSubmit, onBack }: Props) {
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({});

  function toggle(key: QuestionKey, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }

  function handleSubmit() {
    onSubmit(answers as JobContext);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-8"
    >
      <div className="text-center">
        <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mb-2">
          Analyzing: <span className="font-bold">{jobTitle}</span>
        </p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Tell us about your work
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Optional — helps personalize your risk report. Skip any question you&apos;d prefer not to answer.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {QUESTIONS.map(({ key, question, options }) => (
          <div key={key}>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">{question}</p>
            <div className="flex flex-wrap gap-2">
              {options.map(({ value, label }) => {
                const selected = answers[key] === value;
                return (
                  <button
                    key={value}
                    onClick={() => toggle(key, value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                      selected
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-2xl transition-colors shadow-sm"
        >
          Analyze My Risk <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
