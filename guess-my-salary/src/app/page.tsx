"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ResumeUpload } from "@/components/upload/ResumeUpload";
import { SalaryResult } from "@/components/results/SalaryResult";
import { SalaryQuestionsForm } from "@/components/questions/SalaryQuestionsForm";
import { useSalaryAnalysis } from "@/hooks/useSalaryAnalysis";

const STEP_LABELS: Record<string, string> = {
  parsing: "Reading your resume...",
  predicting: "Calculating your market value...",
  explaining: "Writing your breakdown...",
};

export default function Page() {
  const { state, analyze, submitQuestions, reset } = useSalaryAnalysis();

  const isLoading =
    state.status === "parsing" ||
    state.status === "predicting" ||
    state.status === "explaining";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-16 gap-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Guess My Salary 💸
        </h1>
        <p className="mt-2 text-gray-500 text-base max-w-sm mx-auto">
          Upload your resume. Find out what the Indian job market thinks you&apos;re worth.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Idle / Upload */}
        {state.status === "idle" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex justify-center"
          >
            <ResumeUpload onFile={analyze} />
          </motion.div>
        )}

        {/* Questions */}
        {state.status === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl"
          >
            <SalaryQuestionsForm
              prefill={state.prefill}
              onSubmit={(ctx) => submitQuestions(state.resumeText, state.profile, ctx)}
            />
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-10"
          >
            {/* Spinner */}
            <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />

            {/* Step indicators */}
            <div className="flex flex-col items-center gap-2">
              {(["parsing", "predicting", "explaining"] as const).map((step) => {
                const stepIndex = ["parsing", "predicting", "explaining"].indexOf(step);
                const currentIndex = ["parsing", "predicting", "explaining"].indexOf(state.status);
                const isDone = stepIndex < currentIndex;
                const isCurrent = stepIndex === currentIndex;

                return (
                  <div key={step} className="flex items-center gap-2">
                    <span
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isDone
                          ? "bg-indigo-500 text-white"
                          : isCurrent
                            ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400"
                            : "bg-gray-100 text-gray-300",
                      ].join(" ")}
                    >
                      {isDone ? "✓" : stepIndex + 1}
                    </span>
                    <span
                      className={[
                        "text-sm",
                        isCurrent ? "text-gray-700 font-medium" : "text-gray-300",
                      ].join(" ")}
                    >
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {state.status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 max-w-sm text-center"
          >
            <div className="text-4xl">😬</div>
            <p className="text-red-600 font-medium">{state.message}</p>
            <button
              onClick={reset}
              className="mt-2 px-5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Result */}
        {state.status === "done" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <SalaryResult result={state.result} onReset={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
