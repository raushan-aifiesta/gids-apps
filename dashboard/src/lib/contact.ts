export const CONTACT_FLAG_KEY = "meshapi_contact_submitted";

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
  name: string;
  email: string;
  company?: string;
  why?: WhyAI;
  tokens?: TokensRange;
  referrer?: string;
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
    /* quota or disabled — caller still allows request through */
  }
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const endpoint =
    typeof window !== "undefined" && window.location.hostname === "gids.meshapi.ai"
      ? "/api/contact"
      : deriveContactEndpoint();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      referrer: payload.referrer ?? (typeof document !== "undefined" ? document.referrer : undefined),
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Contact submit failed: ${res.status}`);
  }

  markContactSubmitted();
}

function deriveContactEndpoint(): string {
  if (typeof window === "undefined") return "/api/contact";
  // Dashboard serves /api/contact at the root origin. Under multi-zone everything
  // is same-origin, so a relative path works from both the dashboard and any sub-app.
  return `${window.location.origin}/api/contact`;
}
