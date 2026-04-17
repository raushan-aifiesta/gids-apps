const APPS: Array<{
  name: string;
  description: string;
  urlEnv: string;
  fallbackUrl: string;
  accent: string;
}> = [
  {
    name: "Multi-Model Chat",
    description:
      "Compare responses from multiple AI models side by side in a unified chat interface.",
    urlEnv: "NEXT_PUBLIC_CHAT_APP_URL",
    fallbackUrl: "#",
    accent: "linear-gradient(135deg, #7c3aed, #2563eb)",
  },
  {
    name: "Guess My Salary",
    description:
      "Upload your resume and find out what you're worth in the Indian job market.",
    urlEnv: "NEXT_PUBLIC_SALARY_APP_URL",
    fallbackUrl: "#",
    accent: "linear-gradient(135deg, #059669, #10b981)",
  },
  {
    name: "Resume Builder",
    description:
      "Build a polished, ATS-optimized resume from your LinkedIn, GitHub, and uploaded documents.",
    urlEnv: "NEXT_PUBLIC_RESUME_APP_URL",
    fallbackUrl: "#",
    accent: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
];

export default function DashboardPage() {
  const apps = APPS.map((app) => ({
    ...app,
    url: process.env[app.urlEnv] || app.fallbackUrl,
  }));

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
        {apps.map((app) => (
          <a
            key={app.name}
            href={app.url}
            target={app.url === "#" ? undefined : "_blank"}
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: 24,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "transform .2s ease, border-color .2s ease",
              cursor: app.url === "#" ? "not-allowed" : "pointer",
              opacity: app.url === "#" ? 0.6 : 1,
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
