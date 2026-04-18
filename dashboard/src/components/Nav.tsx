import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 h-16 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <a
          href="https://meshapi.ai"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mesh API"
          className="flex items-center gap-2.5"
        >
          <img
            src="/mesh_api_logo_icon.svg"
            alt=""
            className="h-6 w-6"
          />
          <span className="font-mono text-[15px] font-medium tracking-tight text-foreground">
            mesh_api
          </span>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            by
          </span>
          <span className="hidden font-mono text-xs font-medium text-muted-foreground sm:inline">
            AI Fiesta
          </span>
        </a>
        <div className="flex items-center gap-1 sm:gap-5">
          <NavLink href="https://developers.meshapi.ai" label="Docs" />
          <NavLink href="https://meshapi.ai/pricing" label="Pricing" />
          <NavLink href="https://meshapi.ai/models" label="Models" />
          <NavLink href="https://meshapi.ai/ambassador" label="Ambassador" />
          <Button asChild size="sm" className="ml-2">
            <a href="https://app.meshapi.ai" target="_blank" rel="noopener noreferrer">
              Get API key
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
    >
      {label}
    </a>
  );
}
