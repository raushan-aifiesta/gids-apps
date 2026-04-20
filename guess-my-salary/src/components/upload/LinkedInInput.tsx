"use client";

import { useState } from "react";
import { Link, ArrowRight, Loader2 } from "lucide-react";
import { apiPath } from "@/lib/basePath";

interface Props {
  onResume: (resumeText: string) => void;
}

export function LinkedInInput({ onResume }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(apiPath("/api/salary/linkedin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl: trimmed }),
      });
      const json = (await res.json()) as {
        resumeText?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch profile");
      if (!json.resumeText) throw new Error("Empty profile returned");
      onResume(json.resumeText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300">
        <Link className="w-5 h-5 text-indigo-500 shrink-0" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          placeholder="https://linkedin.com/in/your-profile"
          className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
          disabled={loading}
        />
      </div>

      {error && <p className="text-xs text-red-500 px-1">{error}</p>}

      <button
        onClick={handleFetch}
        disabled={!url.trim() || loading}
        className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Fetching profile…
          </>
        ) : (
          <>
            Fetch Profile <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        We&apos;ll read your public LinkedIn profile to estimate your market
        salary
      </p>
    </div>
  );
}
