export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <img src="/mesh_api_logo_icon.svg" alt="" className="h-6 w-6" />
            <span className="font-mono text-[15px] font-medium text-foreground">
              mesh_api
            </span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            One OpenAI-compatible API for every model. Built and billed in India.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: "Home", href: "https://meshapi.ai" },
            { label: "Pricing", href: "https://meshapi.ai/pricing" },
            { label: "Models", href: "https://meshapi.ai/models" },
            { label: "Docs", href: "https://developers.meshapi.ai" },
          ]}
        />
        <FooterCol
          title="Community"
          links={[
            { label: "X / Twitter", href: "https://x.com/aifiesta" },
            { label: "AI Fiesta", href: "https://aifiesta.ai" },
            { label: "Ambassador", href: "https://meshapi.ai/ambassador" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { label: "support@aifiesta.ai", href: "mailto:support@aifiesta.ai" },
            { label: "Contact sales", href: "https://meshapi.ai/contact" },
            { label: "Terms", href: "https://chat.aifiesta.ai/terms" },
            { label: "Privacy", href: "https://chat.aifiesta.ai/privacy" },
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-5">
          <span className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Mesh API. All rights reserved.
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/70">
            Powered by Mesh API
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
