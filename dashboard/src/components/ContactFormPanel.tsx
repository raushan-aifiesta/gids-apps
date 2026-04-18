"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import {
  submitContact,
  hasSubmittedContact,
  WHY_AI_OPTIONS,
  TOKENS_OPTIONS,
  type WhyAI,
  type TokensRange,
} from "@/lib/contact";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export function ContactForm({ variant, onSuccess }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [why, setWhy] = useState<WhyAI | "">("");
  const [tokens, setTokens] = useState<TokensRange | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(() =>
    typeof window !== "undefined" ? hasSubmittedContact() : false,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        why: why || undefined,
        tokens: tokens || undefined,
      });
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
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-5" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">You&apos;re in.</h3>
        <p className="text-sm text-muted-foreground">
          Thanks for sharing. Explore any app — we&apos;ll be in touch.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
            {variant === "modal" ? "Before you continue" : "Stay in the loop"}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">
            {variant === "modal" ? "Tell us who you are" : "Get Mesh API updates"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Only name and email are required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mesh-name">
              Full name <span className="text-primary">*</span>
            </Label>
            <Input
              id="mesh-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
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
              required
            />
          </div>
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

        <Button type="submit" disabled={submitting} className="mt-1 w-full">
          {submitting ? (
            "Sending…"
          ) : (
            <>
              Send <Send className="size-4" />
            </>
          )}
        </Button>
        <p className="mt-0.5 text-center text-[10px] text-muted-foreground/70">
          We&apos;ll never spam. One reply, max.
        </p>
      </form>
    </Card>
  );
}
