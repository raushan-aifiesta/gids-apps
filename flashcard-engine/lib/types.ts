export type CardType = "qa" | "cloze";

export type CardRating = "correct" | "incorrect" | "easy" | "hard" | "skipped";

export type StudyMode = "classic" | "type-answer" | "feynman";

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

export interface CardGradeResult {
  score: number;
  feedback: string;
  suggestedRating: CardRating;
  hintUsed: boolean;
  modelExplanation?: string;
}

export interface FeynmanTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CardProgress {
  cardId: string;
  rating: CardRating;
  reviewedAt: number;
  userAnswer?: string;
  gradeResult?: CardGradeResult;
  feynmanConversation?: FeynmanTurn[];
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
