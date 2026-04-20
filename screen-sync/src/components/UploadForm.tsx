"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Users,
  ChevronRight,
  AlertCircle,
  Linkedin,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPath } from "@/lib/basePath";
import type { ScreeningResponse } from "@/lib/types";

interface UploadFormProps {
  onComplete: (data: ScreeningResponse) => void;
}

const MAX_RESUMES = 5;
const ACCEPTED = ".pdf,.txt";

type JdTab = "upload" | "linkedin" | "paste";

export function UploadForm({ onComplete }: UploadFormProps) {
  const [jdTab, setJdTab] = useState<JdTab>("upload");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdLinkedInUrl, setJdLinkedInUrl] = useState("");
  const [jdPasteText, setJdPasteText] = useState("");
  const [scrapingJd, setScrapingJd] = useState(false);
  const [scrapedJdText, setScrapedJdText] = useState<string | null>(null);

  const [resumes, setResumes] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jdDrag, setJdDrag] = useState(false);
  const [resumeDrag, setResumeDrag] = useState(false);

  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleJdDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setJdDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) setJdFile(file);
  }, []);

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

  async function handleScrapeJd() {
    const url = jdLinkedInUrl.trim();
    if (!url) return;
    setScrapingJd(true);
    setError(null);
    try {
      const res = await fetch(apiPath("/api/scrape-jd"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl: url }),
      });
      const json = await res.json() as { jdText?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Scraping failed");
      setScrapedJdText(json.jdText ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job post");
    } finally {
      setScrapingJd(false);
    }
  }

  function getEffectiveJdText(): string | null {
    if (jdTab === "paste") return jdPasteText.trim() || null;
    if (jdTab === "linkedin") return scrapedJdText;
    return null; // file handled separately
  }

  const handleSubmit = async () => {
    if (resumes.length === 0) return;
    if (jdTab === "upload" && !jdFile) return;
    if (jdTab === "linkedin" && !scrapedJdText) return;
    if (jdTab === "paste" && !jdPasteText.trim()) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();

    if (jdTab === "upload" && jdFile) {
      formData.append("jobDescription", jdFile);
    } else {
      const text = getEffectiveJdText();
      if (text) formData.append("jdText", text);
    }

    resumes.forEach((r) => formData.append("resumes", r));

    try {
      const res = await fetch(apiPath("/api/screen"), {
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

  const jdReady =
    (jdTab === "upload" && jdFile !== null) ||
    (jdTab === "linkedin" && scrapedJdText !== null) ||
    (jdTab === "paste" && jdPasteText.trim().length > 0);
  const ready = jdReady && resumes.length > 0;

  const TAB_OPTIONS: { key: JdTab; label: string; icon: React.ReactNode }[] = [
    { key: "upload", label: "Upload File", icon: <Upload className="h-3.5 w-3.5" /> },
    { key: "linkedin", label: "LinkedIn URL", icon: <Linkedin className="h-3.5 w-3.5" /> },
    { key: "paste", label: "Paste Text", icon: <ClipboardPaste className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Job Description */}
      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
          Job Description
        </label>

        {/* Tabs */}
        <div className="flex rounded-xl border border-slate-700/60 bg-slate-900/40 p-1 gap-1 mb-3">
          {TAB_OPTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setJdTab(key); setError(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                jdTab === key
                  ? "bg-violet-600/80 text-white"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {jdTab === "upload" && (
          <>
            {jdFile ? (
              <div className="flex items-center gap-3 rounded-xl border border-violet-500/40 bg-violet-500/10 p-3">
                <FileText className="h-5 w-5 text-violet-400 shrink-0" />
                <span className="flex-1 text-sm text-slate-200 truncate">{jdFile.name}</span>
                <button onClick={() => setJdFile(null)} className="text-slate-500 hover:text-rose-400 transition-colors">
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
                  jdDrag ? "border-violet-400 bg-violet-500/10" : "border-slate-600 hover:border-violet-500/50 hover:bg-slate-700/30",
                )}
              >
                <Upload className="h-6 w-6 text-slate-500" />
                <p className="text-sm text-slate-400">
                  Drop your JD here or <span className="text-violet-400 font-medium">browse</span>
                </p>
                <p className="text-xs text-slate-600">PDF or TXT</p>
                <input ref={jdInputRef} type="file" accept={ACCEPTED} className="hidden"
                  onChange={(e) => e.target.files?.[0] && setJdFile(e.target.files[0])} />
              </div>
            )}
          </>
        )}

        {jdTab === "linkedin" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 focus-within:border-violet-500/60">
                <Linkedin className="h-4 w-4 text-violet-400 shrink-0" />
                <input
                  type="url"
                  value={jdLinkedInUrl}
                  onChange={(e) => { setJdLinkedInUrl(e.target.value); setScrapedJdText(null); }}
                  placeholder="https://linkedin.com/posts/..."
                  className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder-slate-500"
                  disabled={scrapingJd}
                />
              </div>
              <button
                onClick={handleScrapeJd}
                disabled={!jdLinkedInUrl.trim() || scrapingJd}
                className="px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
              >
                {scrapingJd ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
              </button>
            </div>
            {scrapedJdText && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400">
                ✓ Job description fetched ({scrapedJdText.length} chars)
              </div>
            )}
          </div>
        )}

        {jdTab === "paste" && (
          <textarea
            value={jdPasteText}
            onChange={(e) => setJdPasteText(e.target.value)}
            placeholder="Paste the job description here..."
            rows={6}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/60 resize-none"
          />
        )}
      </div>

      {/* Candidate Resumes */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Users className="h-4 w-4 text-sky-400" />
          Candidate Resumes
          <span className="text-slate-500 font-normal text-xs">(up to {MAX_RESUMES} PDFs)</span>
        </label>

        <div
          onDragOver={(e) => { e.preventDefault(); setResumeDrag(true); }}
          onDragLeave={() => setResumeDrag(false)}
          onDrop={handleResumeDrop}
          onClick={() => resumes.length < MAX_RESUMES && resumeInputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed p-4 transition-all duration-200",
            resumes.length < MAX_RESUMES ? "cursor-pointer" : "cursor-default",
            resumeDrag ? "border-sky-400 bg-sky-500/10" : "border-slate-600 hover:border-sky-500/50 hover:bg-slate-700/30",
          )}
        >
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Upload className="h-6 w-6 text-slate-500" />
              <p className="text-sm text-slate-400">Drop resumes here or <span className="text-sky-400 font-medium">browse</span></p>
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map((r, i) => (
                <div key={r.name + i} className="flex items-center gap-2 rounded-lg bg-slate-700/40 px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-200 truncate">{r.name}</span>
                  <button onClick={() => removeResume(i)} className="text-slate-500 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {resumes.length < MAX_RESUMES && (
                <p className="text-center text-xs text-slate-500 pt-1">+ drop more ({MAX_RESUMES - resumes.length} remaining)</p>
              )}
            </div>
          )}
          <input ref={resumeInputRef} type="file" accept={ACCEPTED} multiple className="hidden"
            onChange={(e) => e.target.files && addResumes(e.target.files)} />
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
          <><Loader2 className="h-4 w-4 animate-spin" />Screening {resumes.length} candidate{resumes.length !== 1 ? "s" : ""}…</>
        ) : (
          <>Screen Candidates<ChevronRight className="h-4 w-4" /></>
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
