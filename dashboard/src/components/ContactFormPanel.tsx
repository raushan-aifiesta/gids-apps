"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Send } from "lucide-react";
import {
  upsertContact,
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

const AUTOSAVE_DELAY_MS = 600;
const RESET_DELAY_MS = 3500;

export function ContactFormPanel() {
  return <ContactForm />;
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [why, setWhy] = useState<WhyAI | "">("");
  const [tokens, setTokens] = useState<TokensRange | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [done, setDone] = useState(false);

  // In-memory id for the current draft session. Cleared on reset.
  const [currentId, setCurrentId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const currentIdRef = useRef<string | null>(null);

  // Keep the ref in sync so the debounce callback sees the latest value
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  // Autosave on any field change (debounced)
  useEffect(() => {
    if (done) return;

    const payload: ContactPayload = {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      why: why || undefined,
      tokens: tokens || undefined,
    };
    const signature = JSON.stringify(payload);
    if (signature === "{}" || signature === lastSavedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSaveState("saving");
        const { id } = await upsertContact(payload, currentIdRef.current ?? undefined);
        if (!currentIdRef.current) setCurrentId(id);
        lastSavedRef.current = signature;
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, email, phone, company, why, tokens, done]);

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setWhy("");
    setTokens("");
    setError(null);
    setSaveState("idle");
    setCurrentId(null);
    currentIdRef.current = null;
    lastSavedRef.current = "";
    setDone(false);
  }

  // Auto-reset the form a few seconds after the thank-you shows
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(resetForm, RESET_DELAY_MS);
    return () => clearTimeout(t);
  }, [done]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required to finish.");
      return;
    }
    setSubmitting(true);
    // Flush any pending debounce immediately with the latest values
    if (debounceRef.current) clearTimeout(debounceRef.current);
    try {
      await upsertContact(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          why: why || undefined,
          tokens: tokens || undefined,
        },
        currentIdRef.current ?? undefined,
      );
      setDone(true);
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
        <h3 className="mb-2 text-xl font-semibold">Thank you.</h3>
        <p className="max-w-[300px] text-sm text-muted-foreground">
          Your response has been recorded. Our team will get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col gap-5 px-8 py-10 sm:py-12">
      <div>
        <p className="mb-2 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          Stay in the loop
        </p>
        <h2 className="text-[22px] font-semibold tracking-tight">
          Get Mesh API updates
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll send occasional updates on new models, pricing, and features.
          Only name and email are required.
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
          <Label htmlFor="mesh-phone">Phone</Label>
          <span className="text-[10px] text-muted-foreground/70">Optional</span>
        </div>
        <Input
          id="mesh-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          autoComplete="tel"
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
          <Label>What&apos;s your AI use case?</Label>
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
            "Sending…"
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
