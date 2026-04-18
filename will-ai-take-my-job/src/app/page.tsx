"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { RecentSearches } from "@/components/search/RecentSearches";
import { ReportView } from "@/components/report/ReportView";
import { ReportSkeleton } from "@/components/skeletons/ReportSkeleton";
import { useJobAnalysis, getRecentSearches } from "@/hooks/useJobAnalysis";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default function Home() {
  const { state, analyze, reset } = useJobAnalysis();
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-rose-50/10 dark:from-slate-950 dark:via-violet-950/20 dark:to-rose-950/10 px-4 py-12">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

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
