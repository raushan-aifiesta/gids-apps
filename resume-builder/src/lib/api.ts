import type { ScrapeResult, UploadResult, GenerateResult } from "./types";
import { apiPath } from "./basePath";

export async function scrapeProfiles(
  linkedInUrl?: string,
  githubUsername?: string
): Promise<ScrapeResult> {
  const res = await fetch(apiPath("/api/scrape"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ linkedInUrl, githubUsername }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to scrape profiles");
  }
  return res.json();
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(apiPath("/api/upload"), { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to upload document");
  }
  return res.json();
}

export async function generateResume(payload: {
  linkedInData?: unknown;
  githubData?: unknown;
  documentText?: string;
  uploadedFileGcsPath?: string;
}): Promise<GenerateResult> {
  const res = await fetch(apiPath("/api/resume/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to generate resume");
  }
  return res.json();
}
