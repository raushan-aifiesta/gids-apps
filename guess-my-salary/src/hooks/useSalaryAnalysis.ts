"use client";

import { useState, useCallback } from "react";
import { extractTextFromPdf } from "@/lib/pdfText";
import { parseResume, analyzeSalary } from "@/lib/api";
import type { AnalysisState, ResumeProfile, UserContext } from "@/lib/types";

export function useSalaryAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });

  const analyze = useCallback(async (file: File) => {
    try {
      setState({ status: "parsing" });
      const resumeText = await extractTextFromPdf(file);
      const { profile, prefill } = await parseResume(resumeText);
      setState({ status: "questions", resumeText, profile, prefill });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }, []);

  const analyzeText = useCallback(async (resumeText: string) => {
    try {
      setState({ status: "parsing" });
      const { profile, prefill } = await parseResume(resumeText);
      setState({ status: "questions", resumeText, profile, prefill });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }, []);

  const submitQuestions = useCallback(
    async (resumeText: string, profile: ResumeProfile, userContext: UserContext) => {
      try {
        setState({ status: "predicting" });
        await new Promise((resolve) => setTimeout(resolve, 50));

        const resultPromise = analyzeSalary(resumeText, userContext, profile);

        const explainTimer = setTimeout(() => {
          setState({ status: "explaining" });
        }, 3000);

        const result = await resultPromise;
        clearTimeout(explainTimer);

        setState({ status: "done", result });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, analyze, analyzeText, submitQuestions, reset };
}
