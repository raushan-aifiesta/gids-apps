import { z } from "zod";

// Base card shape — id is optional so both generate (no id) and
// refine (id preserved from input) responses can use the same schema.
export const FlashcardSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["qa", "cloze"]),
  question: z.string().min(1),
  answer: z.string().min(1),
  hint: z.string().optional(),
});

export const FlashcardsResponseSchema = z.object({
  cards: z.array(FlashcardSchema).min(1),
});

export type FlashcardRaw = z.infer<typeof FlashcardSchema>;
export type FlashcardsResponse = z.infer<typeof FlashcardsResponseSchema>;
