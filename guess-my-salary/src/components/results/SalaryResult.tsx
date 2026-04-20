"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { ConfidenceBar } from "./ConfidenceBar";
import { ExplanationCard } from "./ExplanationCard";
import type { SalaryAnalysisResponse, SalaryVerdict } from "@/lib/types";

interface SalaryResultProps {
  result: SalaryAnalysisResponse;
  onReset: () => void;
}

function getVerdict(current: number, min: number, max: number): SalaryVerdict {
  if (current < min * 0.9) return "underpaid";
  if (current > max * 1.1) return "overpaid";
  return "fair";
}

const USER_VERDICT_CONFIG: Record<SalaryVerdict, { label: string; emoji: string; bg: string; text: string }> = {
  underpaid: {
    label: "You're being underpaid",
    emoji: "📉",
    bg: "bg-red-50 border-red-200",
    text: "text-red-600",
  },
  fair: {
    label: "Your salary is fair",
    emoji: "✅",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-600",
  },
  overpaid: {
    label: "You're doing great!",
    emoji: "🚀",
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-600",
  },
};

function verdictStyle(label: string): { bg: string; text: string; border: string } {
  const l = label.toUpperCase();
  if (l.includes("UNDERPAID"))
    return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" };
  if (l.includes("OVERPAID"))
    return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" };
  return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
}

export function SalaryResult({ result, onReset }: SalaryResultProps) {
  const { prediction, profile, explanation } = result;
  const [currentSalaryInput, setCurrentSalaryInput] = useState("");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { SalaryPDF } = await import("./SalaryPDF");
      const blob = await pdf(<SalaryPDF result={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "salary-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const currentSalary = parseFloat(currentSalaryInput);
  const hasCurrentSalary = !isNaN(currentSalary) && currentSalary > 0;
  const userVerdict = hasCurrentSalary
    ? getVerdict(currentSalary, prediction.min, prediction.max)
    : null;

  const vs = verdictStyle(explanation.verdict_label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl flex flex-col gap-5"
    >
      {/* Download button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>
      <div className="flex flex-col gap-5">
      {/* Verdict Banner */}
      <div className={`rounded-2xl border px-6 py-4 flex items-center gap-3 ${vs.bg} ${vs.border}`}>
        <span className="text-2xl">
          {explanation.verdict_label.toUpperCase().includes("UNDERPAID")
            ? "📉"
            : explanation.verdict_label.toUpperCase().includes("OVERPAID")
              ? "🚀"
              : "⚖️"}
        </span>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Market verdict</p>
          <p className={`text-lg font-bold ${vs.text}`}>{explanation.verdict_label}</p>
        </div>
      </div>

      {/* Salary Range Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Predicted market salary · India
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {profile.current_role}
          {profile.location ? ` · ${profile.location}` : ""}
          {profile.years_experience > 0 ? ` · ${profile.years_experience} yrs exp` : ""}
        </p>

        {prediction.compensation_type === "variable" ? (
          // Variable comp layout: base + OTE
          <div className="flex flex-col gap-3 mb-5">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Base salary</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{prediction.min}L – ₹{prediction.max}L
              </p>
            </div>
            {prediction.ote_min !== undefined && prediction.ote_max !== undefined && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-xs text-emerald-600 font-semibold mb-0.5">
                  OTE (On-Target Earnings at 100% quota)
                </p>
                <p className="text-2xl font-bold text-emerald-700">
                  ₹{prediction.ote_min}L – ₹{prediction.ote_max}L
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  Actual take-home depends on performance
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Median base: <span className="font-semibold text-gray-700">₹{prediction.median}L</span>
            </p>
          </div>
        ) : (
          // Fixed comp layout
          <div className="mb-5">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                ₹{prediction.min}L – ₹{prediction.max}L
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Median: <span className="font-semibold text-gray-700">₹{prediction.median}L</span>
            </p>
          </div>
        )}

        <ConfidenceBar confidence={prediction.confidence} />
      </div>

      {/* Current Salary Input + Verdict */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {prediction.compensation_type === "variable"
            ? "What's your current base salary?"
            : "What's your current salary?"}{" "}
          <span className="text-gray-400 font-normal">(optional — see how you compare)</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">₹</span>
          <input
            type="number"
            min={0}
            placeholder="e.g. 18"
            value={currentSalaryInput}
            onChange={(e) => setCurrentSalaryInput(e.target.value)}
            className="w-36 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <span className="text-gray-400 text-sm">lakhs / year</span>
        </div>

        {userVerdict && (
          <motion.div
            key={userVerdict}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${USER_VERDICT_CONFIG[userVerdict].bg}`}
          >
            <span className="text-2xl">{USER_VERDICT_CONFIG[userVerdict].emoji}</span>
            <span className={`font-semibold text-sm ${USER_VERDICT_CONFIG[userVerdict].text}`}>
              {USER_VERDICT_CONFIG[userVerdict].label}
            </span>
          </motion.div>
        )}
      </div>

      {/* Skills snapshot */}
      {profile.skills.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Skills detected
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, 20).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Structured Explanation */}
      <ExplanationCard explanation={explanation} />
      </div>{/* end resultRef div */}

      {/* Reset */}
      <button
        onClick={onReset}
        className="self-center mt-2 text-sm text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition-colors"
      >
        Analyze another resume
      </button>
    </motion.div>
  );
}
