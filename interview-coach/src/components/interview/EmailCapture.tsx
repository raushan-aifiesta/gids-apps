"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, CheckCircle, RotateCcw, Sparkles, Lock } from "lucide-react";
import type { SessionState } from "./HotSeat";
import { apiPath } from "@/lib/basePath";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  session: SessionState;
  onDone: () => void;
}

export default function EmailCapture({ session, onDone }: Props) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const res = await fetch(apiPath("/api/email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          sessionId: session.sessionId,
          nickname: "Anonymous",
          mode: session.mode,
          answers: session.answers,
          finalScore: session.finalScore,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send report");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-5"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Report Sent!</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Check your inbox for your full interview breakdown including
            per-question analysis and improvement tips.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onDone}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition"
          >
            <RotateCcw size={14} />
            New Session
          </button>
        </div>
      </motion.div>
    );
  }

  const finalScore = session.finalScore!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
          <Sparkles size={24} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Unlock Full Report</h2>
        <p className="text-slate-400 text-sm">
          Get your complete performance analysis delivered to your inbox
        </p>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Overall Score</span>
          <span className="text-2xl font-bold text-white">
            {finalScore.overall}
            <span className="text-sm text-slate-500">/100</span>
          </span>
        </div>
        <div className="h-px bg-slate-800" />
        <div className="space-y-2 text-sm text-slate-400">
          {[
            "✅ Question-by-question breakdown",
            "✅ Missed concepts and how to fix them",
            "✅ Accuracy & clarity scores per answer",
            "✅ Personalised improvement roadmap",
          ].map((item) => (
            <div key={item}>{item}</div>
          ))}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Lock size={11} />
            Full detailed feedback for each answer
          </div>
        </div>
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
          />
          {errors.email && (
            <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs px-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <Mail size={16} />
              Send My Report
            </>
          )}
        </button>
      </form>

      <p className="text-center text-slate-600 text-xs">
        No spam. Just your report. Unsubscribe anytime.
      </p>

      <button
        onClick={onDone}
        className="w-full text-slate-600 hover:text-slate-400 text-sm py-1 transition"
      >
        Skip
      </button>
    </motion.div>
  );
}
