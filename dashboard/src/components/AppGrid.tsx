"use client";

interface App {
  name: string;
  tag: string;
  description: string;
  href: string;
  glyph: string;
}

const APPS: App[] = [
  {
    name: "Multi-Model Chat",
    tag: "CHAT · STREAMING",
    description:
      "Compare responses from GPT, Claude, Gemini and more side-by-side in one chat.",
    href: "/apps/chat-app",
    glyph: "◎",
  },
  {
    name: "Guess My Salary",
    tag: "RESUME · PREDICTION",
    description:
      "Upload your resume and get a data-backed salary estimate for the Indian market.",
    href: "/apps/guess-my-salary",
    glyph: "₹",
  },
  {
    name: "Resume Builder",
    tag: "GENERATION · PDF",
    description:
      "LinkedIn + GitHub + your docs → an ATS-optimized resume, rendered to PDF.",
    href: "/apps/resume-builder",
    glyph: "✦",
  },
  {
    name: "Flashcard Engine",
    tag: "STUDY · OCR",
    description:
      "Turn any PDF into a spaced-repetition deck. Study in-browser or export to Anki.",
    href: "/apps/flashcard-engine",
    glyph: "❐",
  },
  {
    name: "Will AI Take My Job?",
    tag: "RESEARCH · REPORT",
    description:
      "Search any role, get a risk report with upskill recommendations to stay ahead.",
    href: "/apps/will-ai-take-my-job",
    glyph: "✺",
  },
  {
    name: "Interview Coach",
    tag: "PRACTICE · FEEDBACK",
    description:
      "A timed mock interview with AI feedback, scoring, and a live leaderboard.",
    href: "/apps/interview-coach",
    glyph: "✎",
  },
  {
    name: "Invoice Processor",
    tag: "EXTRACTION · PDF",
    description:
      "Extract line items from messy invoices and render a clean, shareable PDF.",
    href: "/apps/invoice-processor",
    glyph: "⎙",
  },
  {
    name: "Screen Sync",
    tag: "HIRING · RANKING",
    description:
      "Score and rank candidate resumes against a job description in one pass.",
    href: "/apps/screen-sync",
    glyph: "⊞",
  },
];

export function AppGrid() {
  return (
    <section
      id="apps"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 24px 96px",
      }}
    >
      <div className="divider" style={{ marginBottom: 64 }} />
      <div style={{ marginBottom: 40, maxWidth: 680 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>
          The apps
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 12 }}>
          Real, working products.
        </h2>
        <p style={{ fontSize: 16, color: "hsl(var(--muted-fg))", lineHeight: 1.55 }}>
          Every card links to a live app running on Mesh API. Click any of them — the
          same code patterns, every time.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {APPS.map((app) => (
          <Card key={app.href} app={app} />
        ))}
      </div>
    </section>
  );
}

function Card({ app }: { app: App }) {
  return (
    <a
      href={app.href}
      className="card-surface"
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform 0.25s var(--ease-spring), border-color 0.25s ease, background 0.25s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)";
        e.currentTarget.style.background = "hsl(var(--card-elevated))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "hsl(var(--border))";
        e.currentTarget.style.background = "hsl(var(--card))";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "hsl(var(--primary-soft))",
          color: "hsl(var(--primary))",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          marginBottom: 4,
        }}
      >
        {app.glyph}
      </div>
      <p
        className="mono"
        style={{
          fontSize: 11,
          color: "hsl(var(--primary))",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {app.tag}
      </p>
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{app.name}</h3>
      <p style={{ fontSize: 14, color: "hsl(var(--muted-fg))", lineHeight: 1.5 }}>
        {app.description}
      </p>
      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          fontSize: 13,
          fontWeight: 500,
          color: "hsl(var(--primary))",
        }}
      >
        Open app →
      </div>
    </a>
  );
}
