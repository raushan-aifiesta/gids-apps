# Flashcard Engine

An AI-powered flashcard study app. Upload a PDF, get flashcards generated automatically, then study them with three distinct interaction modes.

## Features

### PDF → Flashcards Pipeline
1. Upload a PDF (with optional page-range selection for large files)
2. Text is extracted client-side (pdf.js + Tesseract.js OCR fallback)
3. Cards are generated via `google/gemini-2-5-flash` — mix of Q&A and fill-in-the-blank
4. A refinement pass improves card quality before the study session begins

### Study Modes

#### Classic
Flip cards to reveal the answer, then self-rate on a 4-point scale (Incorrect → Hard → Easy → Correct). Supports swipe gestures on mobile and keyboard shortcuts on desktop.

#### Type to Answer
Instead of flipping, type your answer into a text field and submit. Claude (`claude-sonnet-4-6`) grades your response and returns:
- An accuracy score (0–100%)
- 1–2 sentences of feedback
- A suggested rating pre-highlighted on the rating buttons

You can confirm the AI's suggestion or override it with any rating before moving on.

#### Feynman Mode
Explain the concept in plain language — no jargon, no circular definitions. Claude evaluates **conceptual clarity**, not keyword matching:
- If your explanation uses jargon without grounding it, Claude pushes back with a follow-up question (e.g. "You used 'osmosis' — what's actually happening to the molecules?")
- You respond to the follow-up in the same input
- After a satisfactory explanation (or 2 follow-up rounds), Claude gives a final grade and suggested rating

### Contextual Hinting (Nudge)
In Type to Answer and Feynman modes, if you haven't typed anything for 10 seconds, a "Need a nudge?" button appears. Clicking it fetches a single minimal hint — the first letter, a category clue, or a one-word association — without revealing the answer. One hint per card, and `hintUsed` is recorded on the card's grade result.

### Other Features
- Card grid overview with color-coded completion status — jump to any card
- Session persistence via localStorage — resume where you left off
- Export deck to Anki-compatible CSV
- Shuffle and restart controls

## Setup

```bash
cd flashcard-engine
pnpm install
cp .env.local.example .env.local   # fill in values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MESH_API_KEY` | API key for the Mesh LLM gateway |
| `MESH_API_URL` | Mesh API base URL (defaults to `http://localhost:8000/v1`) |

## AI Models Used

| Task | Model |
|------|-------|
| Flashcard generation | `google/gemini-2-5-flash` |
| Flashcard refinement | `google/gemini-2-5-flash` |
| Answer grading (Type to Answer + Feynman) | `anthropic/claude-sonnet-4-6` |
| Hint generation | `anthropic/claude-sonnet-4-6` |

All LLM calls go through Next.js API routes — the browser never sees API keys.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind 4, Framer Motion (card flip animations)
- pdf.js + Tesseract.js (client-side PDF extraction + OCR)
- OpenAI SDK (Mesh-compatible), Zod, nanoid
