"use client";

import { motion } from "framer-motion";
import type { JobAnalysis } from "@/lib/types";
import { RiskGauge } from "./RiskGauge";
import { ReportHeader } from "./ReportHeader";
import { TaskCard } from "./TaskCard";
import { UpskillRoadmap } from "./UpskillRoadmap";
import { ShareButton } from "./ShareButton";

interface Props {
  analysis: JobAnalysis;
  onReset: () => void;
}

export function ReportView({ analysis, onReset }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Nav row */}
      <div className="flex justify-between items-center">
        <button
          onClick={onReset}
          className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
        >
          ← Search another job
        </button>
        <ShareButton jobTitle={analysis.jobTitle} score={analysis.automationRiskScore} />
      </div>

      {/* Header */}
      <ReportHeader analysis={analysis} />

      {/* Gauge */}
      <div className="flex justify-center">
        <RiskGauge score={analysis.automationRiskScore} riskLevel={analysis.riskLevel} />
      </div>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-600 dark:text-slate-400 text-center text-sm max-w-2xl mx-auto leading-relaxed"
      >
        {analysis.summary}
      </motion.p>

      {/* Task breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskCard
          title="At Risk — AI Can Do This"
          tasks={analysis.atRiskTasks}
          variant="danger"
        />
        <TaskCard
          title="Human Advantage — AI Can't Replace This"
          tasks={analysis.safeHumanTasks}
          variant="safe"
        />
      </div>

      {/* Upskilling roadmap */}
      <UpskillRoadmap steps={analysis.upskillSteps} />

      {/* Footer */}
      <p className="text-center text-xs text-slate-400">
        Analysis generated on {analysis.analysisDate} · Powered by Gemini 2.5 Flash via
        MeshAPI
      </p>
    </div>
  );
}
