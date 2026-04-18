const APPS: Array<{
  name: string;
  description: string;
  href: string;
  accent: string;
}> = [
  {
    name: "Multi-Model Chat",
    description:
      "Compare responses from multiple AI models side by side in a unified chat interface.",
    href: "/chat-app",
    accent: "linear-gradient(135deg, #7c3aed, #2563eb)",
  },
  {
    name: "Guess My Salary",
    description:
      "Upload your resume and find out what you're worth in the Indian job market.",
    href: "/guess-my-salary",
    accent: "linear-gradient(135deg, #059669, #10b981)",
  },
  {
    name: "Resume Builder",
    description:
      "Build a polished, ATS-optimized resume from your LinkedIn, GitHub, and uploaded documents.",
    href: "/resume-builder",
    accent: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
  {
    name: "Flashcard Engine",
    description:
      "Turn any PDF into a spaced-repetition flashcard deck you can study in-browser or export to Anki.",
    href: "/flashcard-engine",
    accent: "linear-gradient(135deg, #ec4899, #f472b6)",
  },
  {
    name: "Will AI Take My Job?",
    description:
      "Search any role and get a risk report with upskill recommendations to stay ahead.",
    href: "/will-ai-take-my-job",
    accent: "linear-gradient(135deg, #0ea5e9, #6366f1)",
  },
  {
    name: "Interview Coach",
    description:
      "Practice a timed mock interview with AI feedback and a live leaderboard.",
    href: "/interview-coach",
    accent: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
  },
  {
    name: "Invoice Processor",
    description:
      "Extract line items from messy invoices and render a clean, shareable PDF.",
    href: "/invoice-processor",
    accent: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  },
  {
    name: "Screen Sync",
    description:
      "Score and rank candidate resumes against a job description in one pass.",
    href: "/screen-sync",
    accent: "linear-gradient(135deg, #f97316, #eab308)",
  },
];

export default function DashboardPage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "64px 24px 80px",
      }}
    >
      <header style={{ marginBottom: 48 }}>
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#a3a3c2",
            marginBottom: 12,
          }}
        >
          GIDS · Powered by Mesh API
        </p>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 16,
            background: "linear-gradient(90deg, #fff, #a5b4fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          GIDS Apps
        </h1>
        <p style={{ fontSize: 17, color: "#b6b6cf", maxWidth: 620 }}>
          A collection of AI-powered apps built on Mesh API. Pick one to get
          started.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {APPS.map((app) => (
          <a
            key={app.name}
            href={app.href}
            style={{
              display: "block",
              padding: 24,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "transform .2s ease, border-color .2s ease",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: app.accent,
                marginBottom: 18,
              }}
            />
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                color: "#fff",
              }}
            >
              {app.name}
            </h2>
            <p style={{ fontSize: 14, color: "#a8a8c4", lineHeight: 1.5 }}>
              {app.description}
            </p>
            <div
              style={{
                marginTop: 20,
                fontSize: 13,
                color: "#c7d2fe",
                fontWeight: 500,
              }}
            >
              Open app →
            </div>
          </a>
        ))}
      </section>

      <footer
        style={{
          marginTop: 64,
          fontSize: 12,
          color: "#6b6b85",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} GIDS Apps
      </footer>
    </main>
  );
}
