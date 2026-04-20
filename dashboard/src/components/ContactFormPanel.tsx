"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Send } from "lucide-react";
import {
  upsertContact,
  finalizeContact,
  hasSubmittedContact,
  WHY_AI_OPTIONS,
  TOKENS_OPTIONS,
  type ContactPayload,
  type WhyAI,
  type TokensRange,
} from "@/lib/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactFormPanel() {
  return <ContactForm variant="panel" />;
}

interface ContactFormProps {
  variant: "panel" | "modal";
  onSuccess?: () => void;
}

const AUTOSAVE_DELAY_MS = 600;

export function ContactForm({ variant, onSuccess }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [why, setWhy] = useState<WhyAI | "">("");
  const [tokens, setTokens] = useState<TokensRange | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [done, setDone] = useState(() =>
    typeof window !== "undefined" ? hasSubmittedContact() : false,
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isDirtyRef = useRef(false);

  // Autosave whenever any tracked field changes (debounced).
  useEffect(() => {
    if (done) return;

    const payload: ContactPayload = {
      name: name || undefined,
      email: email || undefined,
      company: company || undefined,
      why: why || undefined,
      tokens: tokens || undefined,
    };

    const signature = JSON.stringify(payload);
    if (!signature || signature === "{}") return;
    if (signature === lastSavedRef.current) return;
    isDirtyRef.current = true;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSaveState("saving");
        await upsertContact(payload);
        lastSavedRef.current = signature;
        isDirtyRef.current = false;
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, email, company, why, tokens, done]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required to finish.");
      return;
    }
    setSubmitting(true);
    try {
      await finalizeContact({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        why: why || undefined,
        tokens: tokens || undefined,
      });
      lastSavedRef.current = "";
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full min-h-[340px] flex-col items-center justify-center px-8 py-12 text-center">
        <div className="mb-5 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">You&apos;re in.</h3>
        <p className="max-w-[280px] text-sm text-muted-foreground">
          Thanks for sharing — explore any app. We&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col gap-5 px-8 py-10 sm:py-12">
      <div>
        <p className="mb-2 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          {variant === "modal" ? "Before you continue" : "Stay in the loop"}
        </p>
        <h2 className="text-[22px] font-semibold tracking-tight">
          {variant === "modal" ? "Tell us who you are" : "Get Mesh API updates"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll send occasional updates on new models, pricing, and features.
          Only name and email are required to finish — but anything you type is saved.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mesh-name">
          Full name <span className="text-primary">*</span>
        </Label>
        <Input
          id="mesh-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mesh-email">
          Email <span className="text-primary">*</span>
        </Label>
        <Input
          id="mesh-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="mesh-company">Company</Label>
          <span className="text-[10px] text-muted-foreground/70">Optional</span>
        </div>
        <Input
          id="mesh-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc"
          autoComplete="organization"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label>Why AI?</Label>
          <span className="text-[10px] text-muted-foreground/70">Optional</span>
        </div>
        <Select value={why} onValueChange={(v) => setWhy(v as WhyAI)}>
          <SelectTrigger>
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            {WHY_AI_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label>Monthly tokens</Label>
          <span className="text-[10px] text-muted-foreground/70">Optional</span>
        </div>
        <Select value={tokens} onValueChange={(v) => setTokens(v as TokensRange)}>
          <SelectTrigger>
            <SelectValue placeholder="How much do you use?" />
          </SelectTrigger>
          <SelectContent>
            {TOKENS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            "Finalizing…"
          ) : (
            <>
              Send <Send className="size-4" />
            </>
          )}
        </Button>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
          <span>
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved"}
            {saveState === "idle" && "\u00A0"}
          </span>
          <span>We&apos;ll never spam. One reply, max.</span>
        </div>
      </div>
    </form>
  );
}
