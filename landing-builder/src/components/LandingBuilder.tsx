"use client";

import { useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { apiPath } from "@/lib/basePath";
import { TONES, type ToneId } from "@/lib/aesthetics";

type ProductType =
  | "SaaS"
  | "Consumer app"
  | "Developer tool"
  | "E-commerce"
  | "Portfolio"
  | "Event / conference"
  | "Agency"
  | "Other";

const PRODUCT_TYPES: ProductType[] = [
  "SaaS",
  "Consumer app",
  "Developer tool",
  "E-commerce",
  "Portfolio",
  "Event / conference",
  "Agency",
  "Other",
];

const EXAMPLE_DESCRIPTION =
  "Mesh API — one OpenAI-compatible endpoint that routes every AI model. 300+ LLMs, ₹ billing, smart failover. Primary CTA: Get API key.";

interface State {
  html: string | null;
  loading: boolean;
  error: string | null;
  elapsedMs: number | null;
  tone: ToneId | null;
}

export function LandingBuilder() {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<ProductType>("SaaS");
  const [tone, setTone] = useState<ToneId | "">("");
  const [description, setDescription] = useState("");
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<State>({
    html: null,
    loading: false,
    error: null,
    elapsedMs: null,
    tone: null,
  });

  const resultRef = useRef<HTMLDivElement>(null);

  async function onGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      setState((s) => ({
        ...s,
        error: "Please describe the product in at least 10 characters.",
      }));
      return;
    }
    setState({
      html: null,
      loading: true,
      error: null,
      elapsedMs: null,
      tone: (tone || null) as ToneId | null,
    });
    const started = Date.now();
    try {
      const res = await fetch(apiPath("/api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          productName: productName.trim() || undefined,
          productType,
          tone: tone || undefined,
        }),
      });
      const data = (await res.json()) as { html?: string; tone?: ToneId; error?: string };
      if (!res.ok || !data.html) {
        throw new Error(data.error || `Generation failed (${res.status})`);
      }
      setState({
        html: data.html,
        loading: false,
        error: null,
        elapsedMs: Date.now() - started,
        tone: data.tone ?? (tone || null) as ToneId | null,
      });
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err) {
      setState({
        html: null,
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong.",
        elapsedMs: null,
        tone: null,
      });
    }
  }

  async function copyHtml() {
    if (!state.html) return;
    try {
      await navigator.clipboard.writeText(state.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function downloadHtml() {
    if (!state.html) return;
    const blob = new Blob([state.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(productName || "landing-page").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pickedTone = tone ? TONES.find((t) => t.id === tone) : null;

  return (
    <>
      <form
        onSubmit={onGenerate}
        className="rounded-xl border border-[color:var(--border)] bg-card p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Product name" hint="Optional">
            <Input
              value={productName}
              onChange={setProductName}
              placeholder="e.g. Mesh API"
            />
          </Field>
          <Field label="Product type">
            <Select
              value={productType}
              onChange={(v) => setProductType(v as ProductType)}
              options={PRODUCT_TYPES}
            />
          </Field>
        </div>

        <Field
          label="Aesthetic tone"
          hint={pickedTone ? pickedTone.gist : "Claude picks if left empty"}
          className="mt-4"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTone("")}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                tone === ""
                  ? "border-primary bg-primary-soft text-foreground"
                  : "border-[color:var(--border)] text-muted-fg hover:border-white/20 hover:text-foreground"
              }`}
            >
              Auto
            </button>
            {TONES.map((t) => {
              const active = t.id === tone;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-[color:var(--border)] text-muted-fg hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Describe your product" required className="mt-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={EXAMPLE_DESCRIPTION}
            rows={5}
            className="w-full rounded-lg border border-[color:var(--border)] bg-card-elevated px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 resize-y"
          />
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-fg">
            <span>
              Who is it for, what does it do, what&apos;s the main call-to-action?
            </span>
            <button
              type="button"
              onClick={() => setDescription(EXAMPLE_DESCRIPTION)}
              className="transition-colors hover:text-foreground"
            >
              Try example
            </button>
          </div>
        </Field>

        {state.error && <p className="mt-4 text-xs text-red-400">{state.error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-fg">
            Powered by Mesh API. Generation takes 30–90s.
          </p>
          <button
            type="submit"
            disabled={state.loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate landing page
              </>
            )}
          </button>
        </div>
      </form>

      <div ref={resultRef} className="mt-10">
        {state.loading && (
          <div className="rounded-xl border border-[color:var(--border)] bg-card p-16 text-center">
            <Loader2 className="mx-auto mb-4 size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-fg">
              Mesh API is designing your page
              {state.tone
                ? ` in a ${TONES.find((t) => t.id === state.tone)?.label.toLowerCase()} tone`
                : ""}
              …
            </p>
          </div>
        )}

        {state.html && (
          <div className="rounded-xl border border-[color:var(--border)] bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 rounded-full bg-card-elevated p-1">
                <TabButton
                  active={view === "preview"}
                  onClick={() => setView("preview")}
                >
                  <Eye className="size-3.5" />
                  Preview
                </TabButton>
                <TabButton active={view === "code"} onClick={() => setView("code")}>
                  <Code2 className="size-3.5" />
                  Code
                </TabButton>
              </div>
              <div className="flex items-center gap-2">
                {state.elapsedMs !== null && (
                  <span className="hidden font-mono text-[11px] text-muted-fg sm:inline">
                    {(state.elapsedMs / 1000).toFixed(1)}s
                  </span>
                )}
                <IconButton onClick={copyHtml}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </IconButton>
                <IconButton onClick={downloadHtml}>
                  <Download className="size-4" />
                  <span className="hidden sm:inline">Download</span>
                </IconButton>
                <IconButton onClick={() => onGenerate()}>
                  <RefreshCw className="size-4" />
                  <span className="hidden sm:inline">Regenerate</span>
                </IconButton>
              </div>
            </div>

            {view === "preview" ? (
              <iframe
                title="Generated landing page"
                srcDoc={state.html}
                sandbox="allow-scripts allow-same-origin"
                className="block h-[78vh] w-full bg-white"
              />
            ) : (
              <pre className="max-h-[78vh] overflow-auto bg-[#0a0b0f] p-4 text-[12.5px] leading-relaxed text-[#e8e8f0]">
                <code>{state.html}</code>
              </pre>
            )}
          </div>
        )}

        {!state.loading && !state.html && !state.error && (
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-card/50 p-10 text-center">
            <Sparkles className="mx-auto mb-3 size-5 text-primary" />
            <p className="text-sm text-muted-fg">
              Pick a tone (or leave on Auto), fill in the brief above, and click
              Generate — your landing page will render here in a sandboxed preview.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-medium text-muted-fg">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] text-muted-fg/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[color:var(--border)] bg-card-elevated px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
      autoComplete="off"
    />
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-lg border border-[color:var(--border)] bg-card-elevated px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-card-elevated">
          {o}
        </option>
      ))}
    </select>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-muted-fg hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[12px] text-muted-fg transition-colors hover:border-white/20 hover:text-foreground"
    >
      {children}
    </button>
  );
}
