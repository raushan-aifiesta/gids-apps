import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CareerForm } from "@/components/CareerForm";

export const metadata = {
  title: "Careers — Mesh API",
  description:
    "Help us route every LLM through a single endpoint. Apply to join the Mesh API team.",
};

export default function CareersPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to apps
      </Link>

      <header className="mb-10">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          Careers
        </p>
        <h1 className="mb-4 text-[clamp(32px,4.5vw,52px)] font-semibold leading-[1.05] tracking-[-0.03em]">
          Build the <span className="text-primary">routing layer</span>
          <br />
          for every AI model.
        </h1>
        <p className="max-w-[560px] text-base leading-relaxed text-muted-foreground">
          Mesh API is a small team shipping the infrastructure that powers the apps
          you see on this site and hundreds of others. If you want to work on
          low-latency multi-model routing, billing rails, or the developer experience
          around them, drop your CV below.
        </p>
      </header>

      <CareerForm />
    </main>
  );
}
