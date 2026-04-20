"use client";

import { useEffect, useState } from "react";
import { apiPath } from "./basePath";

const FLAG_KEY = "meshapi_contact_submitted";
const SUBMIT_EVENT = "meshapi-contact-submitted";

const WHY_AI_OPTIONS = [
  "Prototyping a feature",
  "Building a production product",
  "Research / experimentation",
  "Learning / personal project",
  "Other",
] as const;

const TOKENS_OPTIONS = [
  "< 100K",
  "100K – 1M",
  "1M – 10M",
  "10M – 100M",
  "100M+",
] as const;

export function ContactGateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(FLAG_KEY) === "true") return;

    const originalFetch = window.fetch.bind(window);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    if (!basePath) return; // safety — without basePath we can't distinguish sub-app /api calls
    const apiPrefix = `${basePath}/api/`;

    const patchedFetch: typeof fetch = async (...args) => {
      const input = args[0];
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : (input as Request).url;
      const isApiCall = url.includes(apiPrefix);
      const flagged = window.localStorage.getItem(FLAG_KEY) === "true";

      if (isApiCall && !flagged) {
        setShowModal(true);
        await new Promise<void>((resolve) => {
          const handler = () => {
            window.removeEventListener(SUBMIT_EVENT, handler);
            resolve();
          };
          window.addEventListener(SUBMIT_EVENT, handler);
        });
      }
      return originalFetch(...args);
    };

    window.fetch = patchedFetch;
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <>
      {children}
      {showModal && (
        <ContactModal
          onSubmitted={() => {
            window.localStorage.setItem(FLAG_KEY, "true");
            window.dispatchEvent(new Event(SUBMIT_EVENT));
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function ContactModal({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [why, setWhy] = useState("");
  const [tokens, setTokens] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      // /api/contact lives at the dashboard root origin — NOT under the sub-app basePath,
      // so this request is not intercepted by our patched fetch (different prefix).
      const res = await fetch(apiPath("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          why: why || undefined,
          tokens: tokens || undefined,
          referrer:
            typeof document !== "undefined" ? document.referrer : undefined,
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Request failed (${res.status})`);
      }
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={OVERLAY_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mesh-gate-title"
    >
      <form onSubmit={submit} style={MODAL_STYLE}>
        <p style={EYEBROW_STYLE}>Before you continue</p>
        <h3
          id="mesh-gate-title"
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 8,
            color: "#fff",
          }}
        >
          Tell us who you are
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 20,
          }}
        >
          Quick hello before your first request. Only name and email are
          required.
        </p>

        <ModalField label="Full name" required>
          <ModalInput value={name} onChange={setName} placeholder="Jane Doe" />
        </ModalField>
        <ModalField label="Email" required>
          <ModalInput
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="jane@company.com"
          />
        </ModalField>
        <ModalField label="Company" hint="Optional">
          <ModalInput
            value={company}
            onChange={setCompany}
            placeholder="Acme Inc"
          />
        </ModalField>
        <ModalField label="Why AI?" hint="Optional">
          <ModalRadios
            value={why}
            onChange={setWhy}
            options={WHY_AI_OPTIONS}
            name="why"
          />
        </ModalField>
        <ModalField label="Monthly tokens" hint="Optional">
          <ModalRadios
            value={tokens}
            onChange={setTokens}
            options={TOKENS_OPTIONS}
            name="tokens"
            compact
          />
        </ModalField>

        {error && (
          <p style={{ color: "#ff7070", fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} style={SUBMIT_BTN_STYLE}>
          {submitting ? "Sending…" : "Send →"}
        </button>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          We&apos;ll never spam. One reply, max.
        </p>
      </form>
    </div>
  );
}

function ModalField({
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
        <label
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#7c6dfa", marginLeft: 4 }}>*</span>
          )}
        </label>
        {hint && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ModalInput({
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
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff",
        fontSize: 14,
        outline: "none",
        fontFamily: "inherit",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#7c6dfa";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,109,250,0.3)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function ModalRadios({
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
              border: `1px solid ${active ? "#7c6dfa" : "rgba(255,255,255,0.08)"}`,
              background: active ? "rgba(124,109,250,0.12)" : "transparent",
              fontSize: 13,
              color: active ? "#fff" : "rgba(255,255,255,0.7)",
              cursor: "pointer",
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
            {opt}
          </label>
        );
      })}
    </div>
  );
}

const OVERLAY_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  display: "grid",
  placeItems: "center",
  zIndex: 9999,
  padding: 20,
  overflowY: "auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const MODAL_STYLE: React.CSSProperties = {
  background: "#0e1016",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 28,
  width: "100%",
  maxWidth: 460,
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  color: "#ececec",
};

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#7c6dfa",
  marginBottom: 10,
};

const SUBMIT_BTN_STYLE: React.CSSProperties = {
  width: "100%",
  height: 40,
  borderRadius: 9999,
  background: "#7c6dfa",
  color: "white",
  fontWeight: 500,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.15s ease",
  fontFamily: "inherit",
};
