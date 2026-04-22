import { LandingBuilder } from "@/components/LandingBuilder";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[960px] px-6 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          Landing Page Builder
        </p>
        <h1 className="mb-3 text-[clamp(32px,4.5vw,52px)] font-semibold leading-[1.05] tracking-[-0.03em]">
          Describe your product. <span className="text-primary">Ship the page.</span>
        </h1>
        <p className="mx-auto max-w-[600px] text-base text-[color:var(--muted-fg)]">
          A senior-designer-grade landing page generator. Claude writes a complete
          HTML + Tailwind page to your brief — responsive, accessible, copy-ready.
        </p>
      </header>
      <LandingBuilder />
    </main>
  );
}
