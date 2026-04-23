// Forked from open-lovable (firecrawl/open-lovable @ 69bd93b).
// Collapsed the original Anthropic/OpenAI/Google/Groq switch into a single
// OpenAI-compatible client pointed at Mesh API. Mesh accepts provider-prefixed
// model IDs verbatim (e.g. "anthropic/claude-sonnet-4.6", "openai/gpt-4o-mini",
// "openai/gpt-4o"), so every caller downstream can keep passing
// the same string and routing works.

import { createOpenAI } from "@ai-sdk/openai";

const mesh = createOpenAI({
  baseURL: process.env.MESH_API_URL ?? "https://api.meshapi.ai/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

export type ProviderClient = ReturnType<typeof createOpenAI>;

export interface ProviderResolution {
  client: ProviderClient;
  actualModel: string;
}

export function getProviderForModel(modelId: string): ProviderResolution {
  // Callers downstream do `resolution.client(modelId)` — return a shim that
  // forces the chat.completions API path (responses API isn't supported by
  // non-OpenAI models routed through Mesh).
  const shim = ((id: string) => mesh.chat(id)) as unknown as ProviderClient;
  return { client: shim, actualModel: modelId };
}

export default getProviderForModel;
