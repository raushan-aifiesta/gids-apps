export function LeftHeader() {
  return (
    <header className="mb-12">
      <div className="mb-10 flex items-center gap-2">
        <img src="/mesh_api_logo_icon.svg" alt="" className="h-6 w-6" />
        <span className="font-mono text-[15px] font-medium tracking-tight text-foreground">
          mesh_api
        </span>
        <span className="font-mono text-xs text-muted-foreground">by</span>
        <span className="font-mono text-xs font-medium text-muted-foreground">
          AI Fiesta
        </span>
        <span className="ml-auto flex items-center gap-4">
          <a
            href="https://developers.meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </a>
          <a
            href="https://meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            meshapi.ai ↗
          </a>
        </span>
      </div>

      <p className="mb-3 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
        Apps built with Mesh API
      </p>
      <h1 className="mb-4 text-[clamp(32px,4.5vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
        Eight products.
        <br />
        <span className="text-primary">One endpoint.</span>
      </h1>
      <p className="max-w-[520px] text-base leading-relaxed text-muted-foreground">
        Every app below runs on Mesh API — one OpenAI-compatible endpoint that
        routes every major LLM. Click any app to try it live.
      </p>
    </header>
  );
}
