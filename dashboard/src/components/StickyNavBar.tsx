export function StickyNavBar() {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 bg-background/95 backdrop-blur-sm pt-4 pb-3 px-4 mb-8 border-b border-border sm:px-10 lg:border-none lg:bg-transparent lg:backdrop-blur-none lg:static lg:pt-16 lg:pb-0 lg:px-14 lg:mb-10 lg:max-w-[820px] lg:mx-auto lg:w-full">
      <a
        href="https://meshapi.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <img src="/mesh_api_logo_icon.svg" alt="" className="h-6 w-6 shrink-0" />
        <span className="font-mono text-[15px] font-medium tracking-tight text-foreground">
          mesh_api
        </span>
      </a>
      <span className="font-mono text-xs text-muted-foreground">by</span>
      <a
        href="https://aifiesta.ai/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="AI Fiesta"
        className="inline-flex items-center transition-opacity hover:opacity-80"
      >
        <img src="/ai_fiesta_logo.png" alt="AI Fiesta" className="h-5 w-auto" />
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
          className="text-xs text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
        >
          meshapi.ai ↗
        </a>
      </span>
    </div>
  );
}
