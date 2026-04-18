# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Four **independent** Next.js 16 apps in sibling directories — this is *not* a pnpm/turbo workspace. There is no root `package.json`; each app has its own `pnpm-lock.yaml` and is deployed as its own Vercel project.

- `dashboard/` — static landing page that links to the other apps via `NEXT_PUBLIC_*_URL` env vars
- `chat-app/` — multi-model chat (compare model responses side-by-side, streaming SSE)
- `guess-my-salary/` — resume → salary estimate (3-step LLM pipeline with tool calling)
- `resume-builder/` — LinkedIn/GitHub/doc → generated PDF resume (scrape → extract → generate → render → upload)

All four use the same base stack: Next.js 16 (App Router), React 19, TypeScript 6, Tailwind 4, `@tanstack/react-query`, `zustand`, `framer-motion`, `openai` SDK, `nanoid`. Path alias `@/*` → `./src/*` in every app.

## Commands

Run everything inside the target app directory — there is no root-level command.

```bash
cd <app-dir>        # one of: dashboard, chat-app, guess-my-salary, resume-builder
pnpm install
cp .env.local.example .env.local   # if present; fill in values
pnpm dev            # next dev (localhost:3000)
pnpm build          # next build
pnpm start          # next start (prod)
pnpm lint           # next lint — only lint/check; there is no test suite
```

Package manager is pinned to `pnpm@10.32.1` via `packageManager` field.

## Mesh API as a BFF (the core pattern)

Every app that talks to an LLM does so **only from Next.js server routes** — the browser never sees `MESH_API_KEY` or `MESH_API_URL`. The pattern in each route:

```ts
const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});
```

Mesh is OpenAI-compatible, so models are addressed by prefix: `anthropic/claude-sonnet-4-6`, `google/gemini-2-5-flash`, `openai/gpt-4o`, etc. When adding a new LLM call, route it through the app's own `/api/*` endpoint (not directly from client components) and reuse this client construction.

## App-specific architecture

### chat-app — SSE multi-model streaming
- `POST /api/chat` opens a `meshClient.chat.completions.stream(...)` and re-emits each chunk as `data: {...}\n\n` SSE frames, terminated by `data: [DONE]`. Headers set `X-Accel-Buffering: no` to defeat proxy buffering.
- Client (`src/hooks/useChatStream.ts`) reads the SSE stream with a `ReadableStream` reader and a buffer split on `\n\n`. It fires **parallel** streams (one per selected model) via `Promise.allSettled` and appends deltas into Zustand.
- `src/store/chatStore.ts` is the single source of truth: rooms, messages, per-model response slots (`{content, done, error, usage}`), and streaming flag. It persists to `localStorage` via `src/lib/storage.ts` on every mutating action, and hydrates on mount from `app/page.tsx`.
- `GET /api/models` is a simple pass-through to `${MESH_API_URL}/models`. The client filters out models with empty pricing (see `src/lib/api.ts`).

### guess-my-salary — 3-step tool-calling pipeline
`POST /api/salary/analyze` runs three Mesh calls sequentially, each using **forced `tool_choice`** to get structured JSON out:
1. `google/gemini-2-5-flash` with `parse_resume` tool → `ResumeProfile`
2. `anthropic/claude-sonnet-4.5` with `predict_salary` tool → `SalaryPrediction`. **Falls back to `openai/gpt-4o-mini` on failure** (try/catch around the whole call).
3. `openai/gpt-4o` with `explain_salary` tool → `Explanation`

Tool schemas and `sanitize*` validators live in `src/lib/salary.ts`. The pattern is: `tools: [X_TOOL]` + `tool_choice: { type: "function", function: { name: "X" } }` + read `message.tool_calls[0].function.arguments`, then JSON.parse and sanitize. Resume text is clipped to 24000 chars (`MAX_RESUME_TEXT_CHARS`).

PDFs are parsed **client-side** with `pdfjs-dist` in `src/lib/pdfText.ts` — the server route only sees already-extracted text.

### resume-builder — scrape → upload → generate → render pipeline
Four API routes, chained by `src/hooks/useResumeBuilder.ts`:
1. `POST /api/upload` — takes PDF/DOCX, uploads to GCS, server-extracts text via `src/lib/documentExtract.ts` (`pdf-parse` v2 class API for PDFs, dynamic `mammoth` import for DOCX). Max 10 MB. PDFs are *also* extracted client-side for speed; server-extract is the fallback.
2. `POST /api/scrape` — runs LinkedIn scrape (Apify actor `apimaestro/linkedin-profile-detail`) and GitHub scrape (public REST API, no auth) in parallel.
3. `POST /api/resume/generate` — two sequential Mesh calls: Gemini Flash extracts `CandidateProfile` JSON, then Claude Sonnet 4.6 generates `ResumeContent` JSON. Both prompts live in `src/lib/prompts.ts` with matching `sanitize*` functions. Output is parsed from a code-fenced JSON block (or raw JSON) with `/```(?:json)?\s*\n?([\s\S]*?)\n?```/`.
4. PDF rendering uses `@react-pdf/renderer` via **dynamic import** (`await import("@/lib/pdfRenderer")`) to keep it out of the edge bundle. Rendered buffer is uploaded to GCS and returned as a **signed URL valid for 1 hour** (`src/lib/gcs.ts`).

`next.config.ts` here is non-trivial — it must include the native/server-only deps in `serverExternalPackages`:
```ts
serverExternalPackages: ["mammoth", "@react-pdf/renderer", "@google-cloud/storage", "pdf-parse", "apify-client", "proxy-agent"]
```
Omitting any of these will produce "module not found" errors on Vercel (the most recent fix on `main` was adding `proxy-agent` to this list).

GCS creds come from `GCS_PROJECT_ID` + `GCS_CLIENT_EMAIL` + `GCS_PRIVATE_KEY` (newlines escaped as `\n` in the env var — `gcs.ts` un-escapes). Falls back to ADC / `GOOGLE_APPLICATION_CREDENTIALS` if those three aren't set. Default bucket: `gids_apps_assets`.

### dashboard — trivial static page
`src/app/page.tsx` renders a hard-coded `APPS` array and reads `NEXT_PUBLIC_CHAT_APP_URL`, `NEXT_PUBLIC_SALARY_APP_URL`, `NEXT_PUBLIC_RESUME_APP_URL` at build time to populate the card links.

## Environment variables

Per README:
- All Mesh-backed apps (chat-app, guess-my-salary, resume-builder): `MESH_API_KEY`, `MESH_API_URL`
- resume-builder additionally: `APIFY_API_TOKEN`, `GCS_BUCKET_NAME`, `GCS_PROJECT_ID`, `GCS_CLIENT_EMAIL`, `GCS_PRIVATE_KEY`
- dashboard: `NEXT_PUBLIC_CHAT_APP_URL`, `NEXT_PUBLIC_SALARY_APP_URL`, `NEXT_PUBLIC_RESUME_APP_URL`

## Conventions worth following

- Keep Mesh calls server-side only; the client fetches from `/api/*` routes in the same app.
- For structured LLM output, prefer OpenAI-style forced tool calling (see `guess-my-salary`) over prompt-and-parse. When prompt-and-parse is necessary (see `resume-builder`), match the `/```(?:json)?\s*\n?(...)\n?```/` fallback pattern and write a `sanitize*` function next to the type.
- Native/heavy server-only deps must be added to `serverExternalPackages` in that app's `next.config.ts`, or the Vercel build will break.
- There is no shared code between apps — copy-paste is the convention. If you find yourself adding the same helper to two apps, flag it rather than extracting a package (the apps deploy independently and don't share a lockfile).
