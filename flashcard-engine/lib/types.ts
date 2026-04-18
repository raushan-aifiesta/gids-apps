export type CardType = "qa" | "cloze";

export type CardRating = "correct" | "incorrect" | "easy" | "hard" | "skipped";

export interface Flashcard {
  id: string;
  type: CardType;
  question: string;
  answer: string;
  hint?: string;
}

export interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface CardProgress {
  cardId: string;
  rating: CardRating;
  reviewedAt: number;
}

export interface StudySession {
  deckId: string;
  progress: CardProgress[];
  currentIndex: number;
}

export type AppState =
  | { status: "idle" }
  | { status: "extracting" }
  | { status: "page_range"; totalChars: number; totalPages: number }
  | { status: "generating" }
  | { status: "refining" }
  | { status: "studying"; deck: Deck }
  | { status: "error"; message: string };
