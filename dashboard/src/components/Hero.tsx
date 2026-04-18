import type { ReactNode } from "react";

export function Hero({ right }: { right: ReactNode }) {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "80px 24px 64px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 440px)",
          gap: 56,
          alignItems: "start",
        }}
        className="hero-grid"
      >
        <div className="fade-up">
          <p className="eyebrow" style={{ marginBottom: 20 }}>
            Built with Mesh API
          </p>
          <h1
            style={{
              fontSize: "clamp(44px, 6vw, 80px)",
              marginBottom: 24,
            }}
          >
            One API.
            <br />
            <span style={{ color: "hsl(var(--primary))" }}>Endless apps.</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: "hsl(var(--muted-fg))",
              maxWidth: 560,
              marginBottom: 32,
            }}
          >
            Eight production apps, all built on a single OpenAI-compatible endpoint.
            Chat, resumes, invoices, interview prep — proof that Mesh API routes every
            major LLM through one drop-in integration.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="#apps"
              className="btn-primary"
            >
              Explore the apps ↓
            </a>
            <a
              href="https://meshapi.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              View meshapi.ai →
            </a>
          </div>
        </div>
        <div className="fade-up" style={{ animationDelay: "120ms" }}>
          {right}
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
