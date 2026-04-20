export const CONTACT_FLAG_KEY = "meshapi_contact_submitted";
export const LEAD_ID_KEY = "meshapi_lead_id";

export const WHY_AI_OPTIONS = [
  "Prototyping a feature",
  "Building a production product",
  "Research / experimentation",
  "Learning / personal project",
  "Other",
] as const;

export const TOKENS_OPTIONS = [
  "< 100K",
  "100K – 1M",
  "1M – 10M",
  "10M – 100M",
  "100M+",
] as const;

export type WhyAI = (typeof WHY_AI_OPTIONS)[number];
export type TokensRange = (typeof TOKENS_OPTIONS)[number];

export interface ContactPayload {
  name?: string;
  email?: string;
  company?: string;
  why?: WhyAI;
  tokens?: TokensRange;
  referrer?: string;
}

function endpoint(): string {
  if (typeof window === "undefined") return "/api/contact";
  return `${window.location.origin}/api/contact`;
}

export function hasSubmittedContact(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONTACT_FLAG_KEY) === "true";
  } catch {
    return false;
  }
}

export function markContactSubmitted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTACT_FLAG_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function getLeadId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LEAD_ID_KEY);
  } catch {
    return null;
  }
}

function setLeadId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEAD_ID_KEY, id);
  } catch {
    /* ignore */
  }
}

/**
 * Upsert a (possibly partial) lead. Returns the row id.
 * If no id is passed, inserts a new row. If id is passed (or present in
 * localStorage), updates that row. Persists the returned id to localStorage
 * so subsequent calls from anywhere on the same origin update the same row.
 */
export async function upsertContact(
  payload: ContactPayload,
): Promise<{ id: string }> {
  const id = getLeadId();

  const body: ContactPayload & { id?: string; referrer?: string } = {
    ...payload,
    referrer:
      payload.referrer ??
      (typeof document !== "undefined" ? document.referrer || undefined : undefined),
  };
  if (id) body.id = id;

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Contact upsert failed: ${res.status}`);
  }

  const data = (await res.json()) as { id: string };
  if (!id && data.id) setLeadId(data.id);
  return { id: data.id };
}

/** Call on explicit "submit" click — flushes the local flag. Also does one last upsert. */
export async function finalizeContact(payload: ContactPayload): Promise<void> {
  await upsertContact(payload);
  markContactSubmitted();
}
