# Will AI Take My Job?

An AI-powered automation risk analyzer. Enter any job title and instantly receive:

- **Automation Risk Score** (0–100%) with animated gauge
- **At-Risk Tasks** — what AI can already or soon perform in your role
- **Human-Safe Tasks** — where human judgment still wins
- **Upskilling Roadmap** — 3 prioritized steps to stay relevant

## Tech Stack

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- MeshAPI via OpenAI SDK (Gemini 2.5 Flash)
- Framer Motion · Shadcn UI · Lucide React · next-themes
- pnpm

## Getting Started

```bash
cp .env.local.example .env.local
# Set MESH_API_URL and MESH_API_KEY in .env.local
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Environment Variables

| Variable | Description |
|---|---|
| `MESH_API_URL` | MeshAPI base URL (e.g. `https://api.meshapi.ai/v1`) |
| `MESH_API_KEY` | MeshAPI authentication key |

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # POST handler → MeshAPI → JobAnalysis JSON
│   ├── layout.tsx             # Root layout with ThemeProvider
│   ├── page.tsx               # Search UI + AnimatePresence transitions
│   └── error.tsx              # Next.js error boundary
├── components/
│   ├── search/                # SearchBar, RecentSearches
│   ├── report/                # ReportView, RiskGauge, TaskCard, UpskillRoadmap, ShareButton
│   ├── skeletons/             # ReportSkeleton
│   └── ui/                    # Shadcn generated components
├── hooks/
│   └── useJobAnalysis.ts      # State machine + localStorage (last 5 searches)
├── lib/
│   ├── types.ts               # JobAnalysis, UpskillStep, AnalysisState
│   ├── prompts.ts             # LLM system prompt + sanitizeJobAnalysis()
│   └── api.ts                 # analyzeJob() client fetch wrapper
└── providers/
    └── ThemeProvider.tsx      # next-themes wrapper
```

## How It Works

1. User types a job title and submits
2. `POST /api/analyze` calls MeshAPI (Gemini 2.5 Flash) with a Labor Market Analyst prompt
3. LLM returns structured JSON in the `JobAnalysis` shape
4. `sanitizeJobAnalysis()` coerces and validates the response
5. Client renders: animated gauge → task breakdown cards → upskilling roadmap

## Recent Searches

The last 5 analyzed job titles are persisted to `localStorage` under key `wai_recent_searches` and shown as clickable pills on the home screen.
