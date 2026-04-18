"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Briefcase,
  Users,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreeningResponse } from "@/lib/types";

interface UploadFormProps {
  onComplete: (data: ScreeningResponse) => void;
}

const MAX_RESUMES = 5;
const ACCEPTED = ".pdf,.txt";

export function UploadForm({ onComplete }: UploadFormProps) {
  const [jd, setJd] = useState<File | null>(null);
  const [resumes, setResumes] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jdDrag, setJdDrag] = useState(false);
  const [resumeDrag, setResumeDrag] = useState(false);

  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // ── JD handlers ──────────────────────────────────────────────────────
  const handleJdDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setJdDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) setJd(file);
  }, []);

  // ── Resume handlers ───────────────────────────────────────────────────
  const addResumes = useCallback((files: FileList | File[]) => {
    setResumes((prev) => {
      const next = [...prev];
      for (const f of Array.from(files)) {
        if (next.length >= MAX_RESUMES) break;
        if (!next.find((r) => r.name === f.name)) next.push(f);
      }
      return next;
    });
  }, []);

  const handleResumeDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setResumeDrag(false);
      addResumes(e.dataTransfer.files);
    },
    [addResumes],
  );

  const removeResume = (index: number) =>
    setResumes((prev) => prev.filter((_, i) => i !== index));

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!jd || resumes.length === 0) return;
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("jobDescription", jd);
    resumes.forEach((r) => formData.append("resumes", r));

    try {
      const res = await fetch("/api/screen", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Screening failed. Please try again.");
        return;
      }
      onComplete(json as ScreeningResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ready = jd !== null && resumes.length > 0;

  return (
    <div className="space-y-6">
      {/* Job Description drop zone */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Briefcase className="h-4 w-4 text-violet-400" />
          Job Description
          <span className="text-slate-500 font-normal text-xs">(PDF or TXT)</span>
        </label>

        {jd ? (
          <div className="flex items-center gap-3 rounded-xl border border-violet-500/40 bg-violet-500/10 p-3">
            <FileText className="h-5 w-5 text-violet-400 shrink-0" />
            <span className="flex-1 text-sm text-slate-200 truncate">{jd.name}</span>
            <button
              onClick={() => setJd(null)}
              className="text-slate-500 hover:text-rose-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setJdDrag(true); }}
            onDragLeave={() => setJdDrag(false)}
            onDrop={handleJdDrop}
            onClick={() => jdInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200",
              jdDrag
                ? "border-violet-400 bg-violet-500/10"
                : "border-slate-600 hover:border-violet-500/50 hover:bg-slate-700/30",
            )}
          >
            <Upload className="h-6 w-6 text-slate-500" />
            <p className="text-sm text-slate-400">
              Drop your JD here or{" "}
              <span className="text-violet-400 font-medium">browse</span>
            </p>
            <input
              ref={jdInputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setJd(e.target.files[0])}
            />
          </div>
        )}
      </div>

      {/* Resume drop zone */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Users className="h-4 w-4 text-sky-400" />
          Candidate Resumes
          <span className="text-slate-500 font-normal text-xs">
            (up to {MAX_RESUMES} PDFs)
          </span>
        </label>

        <div
          onDragOver={(e) => { e.preventDefault(); setResumeDrag(true); }}
          onDragLeave={() => setResumeDrag(false)}
          onDrop={handleResumeDrop}
          onClick={() => resumes.length < MAX_RESUMES && resumeInputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed p-4 transition-all duration-200",
            resumes.length < MAX_RESUMES ? "cursor-pointer" : "cursor-default",
            resumeDrag
              ? "border-sky-400 bg-sky-500/10"
              : "border-slate-600 hover:border-sky-500/50 hover:bg-slate-700/30",
          )}
        >
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Upload className="h-6 w-6 text-slate-500" />
              <p className="text-sm text-slate-400">
                Drop resumes here or{" "}
                <span className="text-sky-400 font-medium">browse</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map((r, i) => (
                <div
                  key={r.name + i}
                  className="flex items-center gap-2 rounded-lg bg-slate-700/40 px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-200 truncate">{r.name}</span>
                  <button
                    onClick={() => removeResume(i)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {resumes.length < MAX_RESUMES && (
                <p className="text-center text-xs text-slate-500 pt-1">
                  + drop more ({MAX_RESUMES - resumes.length} remaining)
                </p>
              )}
            </div>
          )}
          <input
            ref={resumeInputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addResumes(e.target.files)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!ready || loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
          ready && !loading
            ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
            : "bg-slate-700 text-slate-500 cursor-not-allowed",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Screening {resumes.length} candidate{resumes.length !== 1 ? "s" : ""}…
          </>
        ) : (
          <>
            Screen Candidates
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-xs text-slate-500">
          AI is evaluating all resumes in parallel — this may take 30–60 seconds.
        </p>
      )}
    </div>
  );
}
