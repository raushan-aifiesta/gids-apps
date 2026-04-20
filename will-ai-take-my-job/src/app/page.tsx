"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { RecentSearches } from "@/components/search/RecentSearches";
import { ReportView } from "@/components/report/ReportView";
import { ReportSkeleton } from "@/components/skeletons/ReportSkeleton";
import { JobContextForm } from "@/components/questions/JobContextForm";
import { useJobAnalysis, getRecentSearches } from "@/hooks/useJobAnalysis";

export default function Home() {
  const { state, analyze, submitWithContext, reset } = useJobAnalysis();
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(getRecentSearches());
  }, []);

  function handleAnalyze(jobTitle: string) {
    analyze(jobTitle);
  }

  function handleReset() {
    reset();
    setRecents(getRecentSearches());
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-rose-950/10 px-4 py-12">

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Search / Error view */}
          {(state.status === "idle" || state.status === "error") && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center gap-8 pt-16"
            >
              {/* Hero */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  AI Labor Market Analysis · 2026
                </div>
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                  Will AI Take
                  <br />
                  My Job?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                  Enter any job title and get an instant, AI-powered automation risk
                  assessment with a personalized upskilling roadmap.
                </p>
              </div>

              <SearchBar onAnalyze={handleAnalyze} isLoading={false} />

              {state.status === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {state.message}
                </motion.p>
              )}

              <RecentSearches searches={recents} onSelect={handleAnalyze} />
            </motion.div>
          )}

          {/* Context questions */}
          {state.status === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="pt-8"
            >
              <JobContextForm
                jobTitle={state.jobTitle}
                onSubmit={(context) => submitWithContext(state.jobTitle, context)}
                onBack={reset}
              />
            </motion.div>
          )}

          {/* Analyzing / Skeleton view */}
          {state.status === "analyzing" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-8"
            >
              <p className="text-center text-sm text-violet-600 dark:text-violet-400 mb-8 font-medium">
                Analyzing with AI Labor Market Analyst...
              </p>
              <ReportSkeleton />
            </motion.div>
          )}

          {/* Report view */}
          {state.status === "done" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pt-8"
            >
              <ReportView analysis={state.result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
