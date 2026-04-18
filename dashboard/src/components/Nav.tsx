export function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "hsl(var(--nav-bg))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid hsl(var(--nav-border))",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="https://meshapi.ai" target="_blank" rel="noopener noreferrer" aria-label="Mesh API">
          <img
            src="/mesh_api_logo_main_dark_theme.svg"
            alt="Mesh API"
            style={{ height: 28, width: "auto", display: "block" }}
          />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a
            href="https://developers.meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hide-mobile"
            style={{ fontSize: 14, color: "hsl(var(--muted-fg))" }}
          >
            Docs
          </a>
          <a
            href="https://meshapi.ai/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="hide-mobile"
            style={{ fontSize: 14, color: "hsl(var(--muted-fg))" }}
          >
            Pricing
          </a>
          <a
            href="https://app.meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ height: 36, padding: "0 16px" }}
          >
            Get API key →
          </a>
        </div>
      </div>
    </nav>
  );
}
