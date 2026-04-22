import { ArrowUpRight } from "lucide-react";

interface App {
  name: string;
  tag: string;
  tagline: string;
  href: string;
  glyph: string;
}

const APPS: App[] = [
  {
    name: "Multi-Model Chat",
    tag: "CHAT",
    tagline: "Compare GPT, Claude, Gemini side-by-side in one chat.",
    href: "/apps/chat-app",
    glyph: "◎",
  },
  {
    name: "Guess My Salary",
    tag: "PREDICTION",
    tagline: "Upload a resume, get a data-backed salary estimate.",
    href: "/apps/guess-my-salary",
    glyph: "₹",
  },
  {
    name: "Resume Builder",
    tag: "GENERATION",
    tagline: "LinkedIn + GitHub + docs → ATS-ready resume PDF.",
    href: "/apps/resume-builder",
    glyph: "✦",
  },
  {
    name: "Flashcard Engine",
    tag: "STUDY",
    tagline: "PDF to spaced-repetition flashcards, in-browser or Anki.",
    href: "/apps/flashcard-engine",
    glyph: "❐",
  },
  {
    name: "Will AI Take My Job?",
    tag: "REPORT",
    tagline: "Automation risk report and upskill roadmap for any role.",
    href: "/apps/will-ai-take-my-job",
    glyph: "✺",
  },
  {
    name: "Interview Coach",
    tag: "PRACTICE",
    tagline: "Timed AI mock interview with scoring and feedback.",
    href: "/apps/interview-coach",
    glyph: "✎",
  },
  {
    name: "Invoice Processor",
    tag: "EXTRACTION",
    tagline: "Extract line items from invoices, export clean PDFs.",
    href: "/apps/invoice-processor",
    glyph: "⎙",
  },
  {
    name: "Screen Sync",
    tag: "HIRING",
    tagline: "Rank candidate resumes against a job description.",
    href: "/apps/screen-sync",
    glyph: "⊞",
  },
  {
    name: "Emoji Charades",
    tag: "GAME",
    tagline: "AI emojifies a movie, song, or book. Guess it in 3 tries.",
    href: "/apps/emoji-charades",
    glyph: "🎲",
  },
  {
    name: "Landing Page Builder",
    tag: "GENERATION · HTML",
    tagline: "Describe your product, ship a ready-to-deploy Tailwind landing page.",
    href: "/apps/landing-builder",
    glyph: "◧",
  },
  {
    name: "Mesh App Builder",
    tag: "GENERATION · REACT",
    tagline: "Describe an app, watch Mesh build and run it live in a sandbox. Chat to edit.",
    href: "/apps/mesh-app-builder",
    glyph: "❖",
  },
  {
    name: "Careers",
    tag: "JOIN THE TEAM",
    tagline: "Work on the routing layer that powers every app on this page.",
    href: "/careers",
    glyph: "✺",
  },
];

export function AppGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {APPS.map((app) => (
        <AppCard key={app.href} app={app} />
      ))}
    </div>
  );
}

function AppCard({ app }: { app: App }) {
  return (
    <a
      href={app.href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-5 transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-[17px] text-primary">
          {app.glyph}
        </div>
        <span className="font-mono text-[10px] font-medium tracking-wider text-muted-foreground/80">
          {app.tag}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold leading-tight tracking-tight">
          {app.name}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {app.tagline}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary">
          Open app
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}
