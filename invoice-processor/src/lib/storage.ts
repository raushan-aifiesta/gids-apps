import type { InvoiceProcessorStorage } from "@/lib/types";
import { createInitialStorage } from "@/lib/invoice";

const STORAGE_KEY = "ai-fiesta-invoice-processor";

export function loadInvoiceProcessorState(): InvoiceProcessorStorage {
  if (typeof window === "undefined") return createInitialStorage();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialStorage();

    return {
      ...createInitialStorage(),
      ...JSON.parse(raw),
    } as InvoiceProcessorStorage;
  } catch {
    return createInitialStorage();
  }
}

export function saveInvoiceProcessorState(state: InvoiceProcessorStorage): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}
