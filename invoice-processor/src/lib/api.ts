import type { InvoiceProcessingResponse, MeshModel } from "@/lib/types";

export async function fetchModels(): Promise<MeshModel[]> {
  const res = await fetch("/api/models");

  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.filter((model): model is MeshModel => Boolean(model?.id && model?.name));
}

export async function processInvoice(
  extractedText: string,
  fileName: string,
  model: string
): Promise<InvoiceProcessingResponse> {
  const res = await fetch("/api/invoice/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: extractedText, fileName, model }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to process invoice");
  }

  return data as InvoiceProcessingResponse;
}
