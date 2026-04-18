import { ArrowUpRight } from "lucide-react";

interface App {
  name: string;
  tag: string;
  description: string;
  href: string;
  glyph: string;
}

const APPS: App[] = [
  {
    name: "Multi-Model Chat",
    tag: "CHAT · STREAMING",
    description:
      "Compare responses from GPT, Claude, Gemini and more side-by-side in one chat.",
    href: "/apps/chat-app",
    glyph: "◎",
  },
  {
    name: "Guess My Salary",
    tag: "RESUME · PREDICTION",
    description:
      "Upload your resume and get a data-backed salary estimate for the Indian market.",
    href: "/apps/guess-my-salary",
    glyph: "₹",
  },
  {
    name: "Resume Builder",
    tag: "GENERATION · PDF",
    description:
      "LinkedIn + GitHub + your docs → an ATS-optimized resume, rendered to PDF.",
    href: "/apps/resume-builder",
    glyph: "✦",
  },
  {
    name: "Flashcard Engine",
    tag: "STUDY · OCR",
    description:
      "Turn any PDF into a spaced-repetition deck. Study in-browser or export to Anki.",
    href: "/apps/flashcard-engine",
    glyph: "❐",
  },
  {
    name: "Will AI Take My Job?",
    tag: "RESEARCH · REPORT",
    description:
      "Search any role, get a risk report with upskill recommendations to stay ahead.",
    href: "/apps/will-ai-take-my-job",
    glyph: "✺",
  },
  {
    name: "Interview Coach",
    tag: "PRACTICE · FEEDBACK",
    description:
      "A timed mock interview with AI feedback, scoring, and a live leaderboard.",
    href: "/apps/interview-coach",
    glyph: "✎",
  },
  {
    name: "Invoice Processor",
    tag: "EXTRACTION · PDF",
    description:
      "Extract line items from messy invoices and render a clean, shareable PDF.",
    href: "/apps/invoice-processor",
    glyph: "⎙",
  },
  {
    name: "Screen Sync",
    tag: "HIRING · RANKING",
    description:
      "Score and rank candidate resumes against a job description in one pass.",
    href: "/apps/screen-sync",
    glyph: "⊞",
  },
];

export function AppGrid() {
  return (
    <section id="apps" className="mx-auto w-full max-w-[1200px] px-6 pb-24">
      <div className="relative my-8 h-px w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </div>

      <div className="mb-10 max-w-2xl">
        <p className="mb-3 font-mono text-[11px] font-medium tracking-wider text-primary uppercase">
          The apps
        </p>
        <h2 className="mb-3 text-[clamp(28px,4vw,44px)] font-semibold tracking-tight">
          Real, working products.
        </h2>
        <p className="text-base text-muted-foreground">
          Every card links to a live app running on Mesh API. Click any of them —
          the same integration pattern, every time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {APPS.map((app) => (
          <AppCard key={app.href} app={app} />
        ))}
      </div>
    </section>
  );
}

function AppCard({ app }: { app: App }) {
  return (
    <a
      href={app.href}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-5 transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80"
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-base text-primary">
          {app.glyph}
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-[10px] font-medium tracking-wider text-primary uppercase">
          {app.tag}
        </p>
        <h3 className="text-[17px] font-semibold leading-tight tracking-tight">
          {app.name}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {app.description}
      </p>
      <div className="mt-auto pt-3 text-[13px] font-medium text-primary">
        Open app →
      </div>
    </a>
  );
}
