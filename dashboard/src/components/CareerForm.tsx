"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileText, Send, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const RESET_DELAY_MS = 4000;

export function CareerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setName("");
    setEmail("");
    setLinkedin("");
    setRole("");
    setMessage("");
    setResume(null);
    setError(null);
    setDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(resetForm, RESET_DELAY_MS);
    return () => clearTimeout(t);
  }, [done]);

  function handleFile(file: File | null) {
    setError(null);
    if (!file) {
      setResume(null);
      return;
    }
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Resume must be a PDF.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError("Resume must be under 10 MB.");
      return;
    }
    setResume(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !linkedin.trim() || !resume) {
      setError("Name, email, LinkedIn URL, and resume PDF are required.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("linkedinUrl", linkedin.trim());
      if (role.trim()) fd.append("role", role.trim());
      if (message.trim()) fd.append("message", message.trim());
      fd.append("resume", resume);

      const res = await fetch("/api/careers", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({ error: "" }))) as { error?: string };
        throw new Error(data.error || `Submission failed (${res.status})`);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Thank you.</h3>
        <p className="mx-auto max-w-[360px] text-sm text-muted-foreground">
          Your application has been received. Our team will review it and reach out if
          there&apos;s a good fit.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="career-name">
            Full name <span className="text-primary">*</span>
          </Label>
          <Input
            id="career-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="career-email">
            Email <span className="text-primary">*</span>
          </Label>
          <Input
            id="career-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career-linkedin">
          LinkedIn URL <span className="text-primary">*</span>
        </Label>
        <Input
          id="career-linkedin"
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/your-handle"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="career-role">Role you&apos;re interested in</Label>
          <span className="text-[10px] text-muted-foreground/70">Optional</span>
        </div>
        <Input
          id="career-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Founding Engineer, ML Intern, DevRel"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="career-message">A note for the team</Label>
          <span className="text-[10px] text-muted-foreground/70">Optional</span>
        </div>
        <textarea
          id="career-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything specific you'd like us to know?"
          rows={4}
          className="flex w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring/30 resize-y"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>
          Resume PDF <span className="text-primary">*</span>
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {resume ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
            <FileText className="size-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{resume.name}</div>
              <div className="text-xs text-muted-foreground">
                {(resume.size / 1024).toFixed(0)} KB
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Remove resume"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/30 hover:text-foreground"
          >
            <Upload className="size-5" />
            <span>Click to upload a PDF (max 10 MB)</span>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          "Submitting…"
        ) : (
          <>
            Submit application <Send className="size-4" />
          </>
        )}
      </Button>
      <p className="text-center text-[10px] text-muted-foreground/70">
        Your resume is stored privately. Only the Mesh API team can access it.
      </p>
    </form>
  );
}
