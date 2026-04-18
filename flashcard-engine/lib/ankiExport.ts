import type { Deck } from "./types";

/**
 * Serializes a deck to Anki-compatible tab-separated CSV.
 * Format: Front\tBack  (one card per line, no header)
 * Import in Anki with: File → Import → select .txt → fields separated by Tab
 */
export function deckToAnkiCsv(deck: Deck): string {
  return deck.cards
    .map((card) => {
      const front = card.question.replace(/\t|\n/g, " ");
      const back = card.answer.replace(/\t|\n/g, " ");
      return `${front}\t${back}`;
    })
    .join("\n");
}

export function downloadAnkiCsv(deck: Deck): void {
  const csv = deckToAnkiCsv(deck);
  const blob = new Blob([csv], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${deck.title.replace(/[^a-z0-9]/gi, "_")}_anki.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
