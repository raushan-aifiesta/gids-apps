"use client";

import { useState } from "react";
import {
  submitContact,
  hasSubmittedContact,
  WHY_AI_OPTIONS,
  TOKENS_OPTIONS,
  type WhyAI,
  type TokensRange,
} from "@/lib/contact";

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
      <div
        className="card-surface"
        style={{ padding: variant === "modal" ? 28 : 28, textAlign: "center" }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            background: "hsl(var(--primary-soft))",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            color: "hsl(var(--primary))",
            fontSize: 22,
          }}
        >
          ✓
        </div>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>You&apos;re in.</h3>
        <p style={{ fontSize: 14, color: "hsl(var(--muted-fg))" }}>
          Thanks for sharing. Explore any app — we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-surface"
      style={{ padding: variant === "modal" ? 28 : 24 }}
    >
      <p className="eyebrow" style={{ marginBottom: 10 }}>
        {variant === "modal" ? "Before you continue" : "Stay in the loop"}
      </p>
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>
        {variant === "modal" ? "Tell us who you are" : "Get Mesh API updates"}
      </h3>
      <p style={{ fontSize: 13, color: "hsl(var(--muted-fg))", marginBottom: 20 }}>
        Quick hello — only name and email are required.
      </p>

      <Field label="Full name" required>
        <Input value={name} onChange={setName} placeholder="Jane Doe" />
      </Field>
      <Field label="Email" required>
        <Input value={email} onChange={setEmail} placeholder="jane@company.com" type="email" />
      </Field>
      <Field label="Company" hint="Optional">
        <Input value={company} onChange={setCompany} placeholder="Acme Inc" />
      </Field>
      <Field label="Why AI?" hint="Optional">
        <Radios value={why} onChange={(v) => setWhy(v as WhyAI)} options={WHY_AI_OPTIONS} name="why" />
      </Field>
      <Field label="Monthly tokens" hint="Optional">
        <Radios
          value={tokens}
          onChange={(v) => setTokens(v as TokensRange)}
          options={TOKENS_OPTIONS}
          name="tokens"
          compact
        />
      </Field>

      {error && (
        <p style={{ fontSize: 13, color: "#ff6b6b", marginBottom: 14 }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%" }}>
        {submitting ? "Sending…" : "Send →"}
      </button>
      <p
        style={{
          fontSize: 11,
          color: "hsl(var(--subtle-fg))",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        We&apos;ll never spam. One reply, max.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <label style={{ fontSize: 12, color: "hsl(var(--muted-fg))", fontWeight: 500 }}>
          {label}
          {required && <span style={{ color: "hsl(var(--primary))", marginLeft: 4 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: "hsl(var(--subtle-fg))" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        background: "hsl(var(--card-elevated))",
        border: "1px solid hsl(var(--border))",
        color: "hsl(var(--foreground))",
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--primary))";
        e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary-focus))";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--border))";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function Radios({
  value,
  onChange,
  options,
  name,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  name: string;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        flexWrap: "wrap",
        gap: compact ? 8 : 6,
      }}
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid ${active ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
              background: active ? "hsl(var(--primary-soft))" : "transparent",
              fontSize: 13,
              cursor: "pointer",
              transition: "border-color 0.15s ease, background 0.15s ease",
              flex: compact ? "0 0 auto" : "1 1 auto",
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={active}
              onChange={() => onChange(opt)}
              style={{ display: "none" }}
            />
            <span style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-fg))" }}>
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
}
