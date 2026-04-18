"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { UpskillStep } from "@/lib/types";

export function UpskillRoadmap({ steps }: { steps: UpskillStep[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-violet-100 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 p-6"
    >
      <div className="flex items-center gap-2 font-semibold text-violet-700 dark:text-violet-400 mb-5">
        <Zap className="w-4 h-4" />
        Your Upskilling Roadmap
      </div>
      <ol className="flex flex-col gap-5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-white mb-0.5">
                {step.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
              {step.resources && step.resources.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {step.resources.map((r, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs rounded-full"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
