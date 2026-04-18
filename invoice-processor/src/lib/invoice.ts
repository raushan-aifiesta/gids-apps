import type {
  ExtractedInvoice,
  InvoiceCategory,
  InvoiceClassification,
  InvoiceLineItem,
  InvoiceProcessorStorage,
} from "@/lib/types";

export const INVOICE_CATEGORIES: InvoiceCategory[] = [
  "software_saas",
  "professional_services",
  "marketing",
  "travel",
  "office_supplies",
  "utilities",
  "rent_facilities",
  "payroll_contractors",
  "taxes_fees",
  "other",
];

export const DEFAULT_MODEL = "openai/gpt-4o-mini";
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_CHARS = 24_000;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanConfidence(value: unknown, fallback = 0.5) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function cleanNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeLineItem(value: unknown): InvoiceLineItem {
  if (!value || typeof value !== "object") {
    return { description: "", sku: null, quantity: null, unitPrice: null, total: null, valid: false };
  }
  const raw = value as Record<string, unknown>;
  const quantity = cleanNumber(raw.quantity);
  const unitPrice = cleanNumber(raw.unitPrice);
  const total = cleanNumber(raw.total);

  // Re-validate: unitPrice * quantity should equal total (within rounding tolerance)
  let valid = typeof raw.valid === "boolean" ? raw.valid : true;
  if (quantity !== null && unitPrice !== null && total !== null) {
    const computed = Math.round(quantity * unitPrice * 100) / 100;
    const reported = Math.round(total * 100) / 100;
    valid = Math.abs(computed - reported) < 0.02;
  }

  return {
    description: cleanText(raw.description),
    sku: typeof raw.sku === "string" && raw.sku.trim() ? raw.sku.trim() : null,
    quantity,
    unitPrice,
    total,
    valid,
  };
}

export function sanitizeExtractedInvoice(value: unknown): ExtractedInvoice {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    vendorName: cleanText(data.vendorName),
    invoiceNumber: cleanText(data.invoiceNumber),
    invoiceDate: cleanText(data.invoiceDate),
    dueDate: cleanText(data.dueDate),
    currency: cleanText(data.currency),
    subtotal: cleanNumber(data.subtotal),
    tax: cleanNumber(data.tax),
    total: cleanNumber(data.total),
    lineItems: Array.isArray(data.lineItems) ? data.lineItems.map(sanitizeLineItem) : [],
  };
}

export function sanitizeClassification(value: unknown): InvoiceClassification {
  const data =
    value && typeof value === "object" ? (value as Partial<InvoiceClassification>) : {};
  const primaryCategory = INVOICE_CATEGORIES.includes(data.primaryCategory as InvoiceCategory)
    ? (data.primaryCategory as InvoiceCategory)
    : "other";
  const secondaryCategory = INVOICE_CATEGORIES.includes(data.secondaryCategory as InvoiceCategory)
    ? (data.secondaryCategory as InvoiceCategory)
    : "";

  return {
    primaryCategory,
    secondaryCategory,
    confidence: cleanConfidence(data.confidence, 0.5),
    rationale: cleanText(data.rationale),
    reviewFlags: Array.isArray(data.reviewFlags)
      ? data.reviewFlags.map(cleanText).filter(Boolean).slice(0, 8)
      : [],
  };
}

export function createInitialStorage(): InvoiceProcessorStorage {
  return {
    selectedModel: "",
    lastResult: null,
  };
}

export function humanizeCategory(category: InvoiceCategory | "") {
  if (!category) return "";

  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mergeModelSelection(selectedModel: string, models: { id: string }[]) {
  if (selectedModel) return selectedModel;
  return models[0]?.id ?? DEFAULT_MODEL;
}

export function summarizeWarnings(
  extractedInvoice: ExtractedInvoice,
  classification: InvoiceClassification
) {
  const warnings: string[] = [];

  if (!extractedInvoice.vendorName) warnings.push("Vendor name could not be confidently extracted.");
  if (!extractedInvoice.invoiceNumber) warnings.push("Invoice number is missing from the structured result.");
  if (extractedInvoice.total === null) warnings.push("Total amount is missing from the structured result.");

  const invalidItems = extractedInvoice.lineItems.filter((item) => !item.valid);
  if (invalidItems.length > 0) {
    warnings.push(
      `${invalidItems.length} line item(s) have a unit price × quantity mismatch — please verify.`
    );
  }

  if (classification.confidence < 0.6) {
    warnings.push("Classification confidence is low. Please review the assigned accounting bucket.");
  }

  return [...warnings, ...classification.reviewFlags];
}
