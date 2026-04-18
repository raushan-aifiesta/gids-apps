"use client";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid hsl(var(--border))",
        marginTop: 32,
        background: "hsl(var(--background))",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 40,
        }}
      >
        <div>
          <img
            src="/mesh_api_logo_main_dark_theme.svg"
            alt="Mesh API"
            style={{ height: 24, width: "auto", marginBottom: 12 }}
          />
          <p style={{ fontSize: 13, color: "hsl(var(--muted-fg))", maxWidth: 240 }}>
            One OpenAI-compatible API for every model. Built and billed in India.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { label: "Home", href: "https://meshapi.ai" },
          { label: "Pricing", href: "https://meshapi.ai/pricing" },
          { label: "Models", href: "https://meshapi.ai/models" },
          { label: "Docs", href: "https://developers.meshapi.ai" },
        ]} />
        <FooterCol title="Community" links={[
          { label: "X / Twitter", href: "https://x.com/aifiesta" },
          { label: "AI Fiesta", href: "https://aifiesta.ai" },
          { label: "Ambassador", href: "https://meshapi.ai/ambassador" },
        ]} />
        <FooterCol title="Support" links={[
          { label: "support@aifiesta.ai", href: "mailto:support@aifiesta.ai" },
          { label: "Contact sales", href: "https://meshapi.ai/contact" },
        ]} />
        <FooterCol title="Legal" links={[
          { label: "Terms", href: "https://chat.aifiesta.ai/terms" },
          { label: "Privacy", href: "https://chat.aifiesta.ai/privacy" },
        ]} />
      </div>
      <div style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 24px",
            fontSize: 12,
            color: "hsl(var(--subtle-fg))",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span>© {new Date().getFullYear()} Mesh API. All rights reserved.</span>
          <span className="mono">Powered by Mesh API</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "hsl(var(--subtle-fg))",
          marginBottom: 14,
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ fontSize: 14, color: "hsl(var(--muted-fg))" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-fg))")}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
