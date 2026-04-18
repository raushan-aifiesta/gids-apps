import type { Deck, StudySession } from "./types";

const DECKS_KEY = "flashcard_decks";
const SESSION_PREFIX = "flashcard_session_";
const MAX_DECKS = 10;

// ── Deck persistence ──────────────────────────────────────────────────────────

export function loadDecks(): Deck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    return raw ? (JSON.parse(raw) as Deck[]) : [];
  } catch {
    return [];
  }
}

export function saveDeck(deck: Deck): void {
  if (typeof window === "undefined") return;
  const decks = loadDecks().filter((d) => d.id !== deck.id);
  decks.unshift(deck);
  if (decks.length > MAX_DECKS) decks.splice(MAX_DECKS);
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

export function deleteDeck(deckId: string): void {
  if (typeof window === "undefined") return;
  const decks = loadDecks().filter((d) => d.id !== deckId);
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  localStorage.removeItem(`${SESSION_PREFIX}${deckId}`);
}

// ── Session persistence ───────────────────────────────────────────────────────

export function loadSession(deckId: string): StudySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${SESSION_PREFIX}${deckId}`);
    return raw ? (JSON.parse(raw) as StudySession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StudySession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${SESSION_PREFIX}${session.deckId}`,
    JSON.stringify(session)
  );
}

export function clearSession(deckId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${SESSION_PREFIX}${deckId}`);
}
