export const WHY_AI_OPTIONS = [
  "Prototyping a feature",
  "Building a production product",
  "Research / experimentation",
  "Learning / personal project",
  "Other",
] as const;

export const TOKENS_OPTIONS = [
  "< 1M",
  "1M – 100M",
  "100M – 1B",
  "1B+",
] as const;

export type WhyAI = (typeof WHY_AI_OPTIONS)[number];
export type TokensRange = (typeof TOKENS_OPTIONS)[number];

export interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  why?: WhyAI;
  tokens?: TokensRange;
  referrer?: string;
}

import { apiPath } from "@/lib/basePath";

/**
 * Upsert a (possibly partial) lead. Caller owns the id: pass it to update
 * the same row during a draft session, omit it to insert a fresh row.
 * No localStorage — a fresh page load (or post-submit reset) starts clean.
 */
export async function upsertContact(
  payload: ContactPayload,
  id?: string,
): Promise<{ id: string }> {
  const body: ContactPayload & { id?: string; referrer?: string } = {
    ...payload,
    referrer:
      payload.referrer ??
      (typeof document !== "undefined" ? document.referrer || undefined : undefined),
  };
  if (id) body.id = id;

  const res = await fetch(apiPath("/api/contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Contact upsert failed: ${res.status}`);
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
