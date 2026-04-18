export function LeftHeader() {
  return (
    <header className="mb-12">
      <div className="mb-10 flex items-center gap-2">
        <img src="/mesh_api_logo_icon.svg" alt="" className="h-6 w-6" />
        <span className="font-mono text-[15px] font-medium tracking-tight text-foreground">
          mesh_api
        </span>
        <span className="font-mono text-xs text-muted-foreground">by</span>
        <a
          href="https://aifiesta.ai/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="AI Fiesta"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src="/ai_fiesta_logo.png"
            alt="AI Fiesta"
            className="h-5 w-auto"
          />
        </a>
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

      <h1 className="mb-3 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.05] tracking-[-0.03em]">
        Apps built with <span className="text-primary">Mesh API</span>
      </h1>
      <p className="text-base text-muted-foreground">
        Click any card to try it live.
      </p>
    </header>
  );
}
