"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkedInInput } from "@/components/inputs/LinkedInInput";
import { GitHubInput } from "@/components/inputs/GitHubInput";
import { DocumentUpload } from "@/components/inputs/DocumentUpload";
import { ProgressStepper } from "@/components/steps/ProgressStepper";
import { ResumePreview } from "@/components/results/ResumePreview";
import { DownloadCard } from "@/components/results/DownloadCard";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";

const LOADING_STATUSES = ["uploading", "scraping", "parsing", "generating"];

export default function Home() {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const { state, build, reset } = useResumeBuilder();
  const isLoading = LOADING_STATUSES.includes(state.status);

  function handleBuild() {
    build({
      linkedInUrl: linkedInUrl.trim() || undefined,
      githubUsername: githubUsername.trim() || undefined,
      documentFile: documentFile ?? undefined,
    });
  }

  function handleReset() {
    setLinkedInUrl("");
    setGithubUsername("");
    setDocumentFile(null);
    reset();
  }

  const hasInput = linkedInUrl.trim() || githubUsername.trim() || documentFile;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Powered by Claude Sonnet 4.6 · Apify
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-bold text-gray-900 mb-3"
          >
            Build Your Perfect Resume
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            Provide your LinkedIn, GitHub, or an existing resume and we&apos;ll
            craft an{" "}
            <span className="text-indigo-600 font-medium">
              ATS-optimized PDF
            </span>{" "}
            in seconds.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {state.status === "idle" || state.status === "error" ? (
            <motion.div
              key="inputs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <LinkedInInput
                  value={linkedInUrl}
                  onChange={setLinkedInUrl}
                  disabled={isLoading}
                />
                <GitHubInput
                  value={githubUsername}
                  onChange={setGithubUsername}
                  disabled={isLoading}
                />
              </div>

              <DocumentUpload
                onFile={setDocumentFile}
                currentFile={documentFile}
                disabled={isLoading}
              />

              {state.status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
                >
                  {state.message}
                </motion.div>
              )}

              <motion.button
                whileHover={hasInput ? { scale: 1.01 } : {}}
                whileTap={hasInput ? { scale: 0.99 } : {}}
                onClick={handleBuild}
                disabled={!hasInput}
                className={[
                  "w-full mt-6 py-3.5 rounded-xl font-semibold text-sm transition-all",
                  hasInput
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed",
                ].join(" ")}
              >
                Build My Resume
              </motion.button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Provide at least one source
              </p>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800 mb-1">
                  Building your resume...
                </p>
                <p className="text-sm text-gray-400">
                  This may take 30–60 seconds
                </p>
              </div>
              <ProgressStepper state={state} />
            </motion.div>
          ) : state.status === "done" ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <ResumePreview resume={state.result.resumeContent} />
                </div>
                <div>
                  <DownloadCard result={state.result} onReset={handleReset} />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
