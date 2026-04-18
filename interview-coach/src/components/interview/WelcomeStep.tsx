"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Upload,
  Zap,
  Brain,
  Flame,
  ChevronRight,
  FileText,
  X,
} from "lucide-react";
import type { InterviewMode } from "@/lib/types";
import { apiPath } from "@/lib/basePath";

const schema = z.object({
  role: z.string().max(60).optional(),
  totalQuestions: z.coerce.number().min(3).max(10),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onStart: (params: {
    mode: InterviewMode;
    resumeText?: string;
    role?: string;
    totalQuestions: number;
  }) => void;
  loading: boolean;
}

export default function WelcomeStep({ onStart, loading }: Props) {
  const [mode, setMode] = useState<InterviewMode>("coach");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { totalQuestions: 5 },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setUploadError("Only PDF files are accepted");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5 MB");
      return;
    }
    setUploadError(null);
    setResumeFile(f);
  };

  const onSubmit = async (values: FormValues) => {
    let resumeText: string | undefined;

    if (resumeFile) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("resume", resumeFile);
        const res = await fetch(apiPath("/api/upload"), { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        resumeText = data.text;
      } catch {
        setUploadError("Failed to parse PDF. Continuing without resume.");
      } finally {
        setUploading(false);
      }
    }

    onStart({
      mode,
      resumeText,
      role: values.role?.trim() || undefined,
      totalQuestions: values.totalQuestions,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-4">
          <Zap size={12} />
          AI INTERVIEW COACH · DEV SUMMIT
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
          The Hot Seat
        </h1>
        <p className="text-slate-400 text-lg">
          Think you can handle it? Prove it.
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role{" "}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              {...register("role")}
              placeholder="e.g. Full-Stack Engineer, DevOps, ML Engineer"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
            />
          </div>

          {/* Question count */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map((n) => (
                <label key={n} className="flex-1">
                  <input
                    type="radio"
                    {...register("totalQuestions")}
                    value={n}
                    className="sr-only peer"
                  />
                  <div className="text-center py-2.5 rounded-xl border border-slate-600/50 text-slate-400 cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-500/10 peer-checked:text-purple-300 hover:border-slate-500 transition text-sm font-medium">
                    {n}
                  </div>
                </label>
              ))}
            </div>
            {errors.totalQuestions && (
              <p className="mt-1 text-red-400 text-xs">
                {errors.totalQuestions.message}
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Interview Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("coach")}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  mode === "coach"
                    ? "border-purple-500 bg-purple-500/10 glow-purple"
                    : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
                }`}
              >
                {mode === "coach" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400" />
                )}
                <Brain
                  size={20}
                  className={mode === "coach" ? "text-purple-400" : "text-slate-500"}
                />
                <div className="mt-2 font-semibold text-sm">Coach Mode</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Constructive feedback, growth-focused
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode("roast")}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  mode === "roast"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
                }`}
                style={
                  mode === "roast"
                    ? { boxShadow: "0 0 24px rgba(249,115,22,0.3)" }
                    : {}
                }
              >
                {mode === "roast" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-400" />
                )}
                <Flame
                  size={20}
                  className={mode === "roast" ? "text-orange-400" : "text-slate-500"}
                />
                <div className="mt-2 font-semibold text-sm">Roast Mode</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Brutal honesty, senior dev pressure
                </div>
              </button>
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resume PDF{" "}
              <span className="text-slate-500 font-normal">
                (optional — unlocks personalised questions)
              </span>
            </label>
            {resumeFile ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <FileText size={16} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-300 text-sm flex-1 truncate">
                  {resumeFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-slate-500 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-dashed border-slate-600 hover:border-purple-500/50 hover:bg-purple-500/5 text-slate-500 hover:text-slate-400 transition"
              >
                <Upload size={20} />
                <span className="text-sm">Click to upload PDF</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadError && (
              <p className="mt-1 text-amber-400 text-xs">{uploadError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all ${
              mode === "roast"
                ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading || uploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                {mode === "roast" ? <Flame size={18} /> : <Brain size={18} />}
                {uploading ? "Parsing resume…" : "Enter the Hot Seat"}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-slate-600 text-xs mt-4">
        No account required · Anonymous session
      </p>
    </motion.div>
  );
}
