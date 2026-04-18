import type { ReactNode } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero({ right }: { right: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-20">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[11px] font-medium tracking-wide text-foreground">
              BUILT WITH MESH API
            </span>
          </div>

          <h1 className="mb-6 text-[clamp(48px,6.8vw,88px)] leading-[1.02] font-semibold tracking-[-0.04em]">
            <span className="block text-foreground">One API.</span>
            <span className="block text-primary">Endless apps.</span>
          </h1>

          <p className="mb-8 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-lg">
            Eight real products, all built on a single OpenAI-compatible
            endpoint. Proof that Mesh API routes every major LLM through one
            drop-in integration.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href="#apps">
                Explore the apps
                <ArrowDown className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://meshapi.ai" target="_blank" rel="noopener noreferrer">
                Visit meshapi.ai
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div>{right}</div>
      </div>
    </section>
  );
}
