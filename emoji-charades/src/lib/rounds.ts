// Server-side in-memory cache of active rounds. Ephemeral by design —
// Vercel serverless instances recycle; if a round vanishes the user
// just starts a new one. Good enough for a casual single-player game.

export type Category = "movies" | "songs" | "books" | "tv-shows" | "mixed";

export interface Round {
  id: string;
  answer: string;
  category: Category;
  categoryLabel: string;   // e.g. "Movie", "Song"
  emojis: string;          // e.g. "🎬🦁👑"
  hints: string[];         // two progressively more specific hints
  strikes: number;         // number of wrong guesses so far
  createdAt: number;
}

const STORE = new Map<string, Round>();
const TTL_MS = 10 * 60 * 1000;       // 10 minutes
const MAX_ROUNDS = 500;               // cap for safety

function gc() {
  const now = Date.now();
  for (const [id, r] of STORE) {
    if (now - r.createdAt > TTL_MS) STORE.delete(id);
  }
  // If still over cap, drop oldest
  if (STORE.size > MAX_ROUNDS) {
    const sorted = [...STORE.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt,
    );
    const toDrop = sorted.slice(0, STORE.size - MAX_ROUNDS);
    for (const [id] of toDrop) STORE.delete(id);
  }
}

export function saveRound(r: Round): void {
  gc();
  STORE.set(r.id, r);
}

export function getRound(id: string): Round | undefined {
  gc();
  return STORE.get(id);
}

export function updateRound(id: string, updates: Partial<Round>): Round | undefined {
  const r = STORE.get(id);
  if (!r) return undefined;
  Object.assign(r, updates);
  return r;
}

export function deleteRound(id: string): void {
  STORE.delete(id);
}
