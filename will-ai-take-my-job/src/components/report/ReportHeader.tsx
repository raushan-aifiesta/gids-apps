import type { JobAnalysis } from "@/lib/types";

const BADGE_STYLES: Record<JobAnalysis["riskLevel"], string> = {
  Low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  Critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function ReportHeader({ analysis }: { analysis: JobAnalysis }) {
  return (
    <div className="text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        Automation Risk Report
      </p>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        {analysis.jobTitle}
      </h2>
      <span
        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${BADGE_STYLES[analysis.riskLevel]}`}
      >
        {analysis.riskLevel} Risk
      </span>
    </div>
  );
}
