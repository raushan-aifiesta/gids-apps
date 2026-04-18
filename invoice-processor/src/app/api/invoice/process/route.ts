import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessage } from "openai/resources/chat/completions";
import {
  DEFAULT_MODEL,
  INVOICE_CATEGORIES,
  MAX_TEXT_CHARS,
  sanitizeClassification,
  sanitizeExtractedInvoice,
  summarizeWarnings,
} from "@/lib/invoice";

export const runtime = "nodejs";

const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "http://localhost:8000/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["vendorName", "invoiceNumber", "invoiceDate", "dueDate", "currency", "subtotal", "tax", "total", "lineItems"],
  properties: {
    vendorName: { type: "string" },
    invoiceNumber: { type: "string" },
    invoiceDate: { type: "string" },
    dueDate: { type: "string" },
    currency: { type: "string" },
    subtotal: { type: ["number", "null"] },
    tax: { type: ["number", "null"] },
    total: { type: ["number", "null"] },
    lineItems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["description", "sku", "quantity", "unitPrice", "total", "valid"],
        properties: {
          description: { type: "string" },
          sku: { type: ["string", "null"] },
          quantity: { type: ["number", "null"] },
          unitPrice: { type: ["number", "null"] },
          total: { type: ["number", "null"] },
          valid: { type: "boolean" },
        },
      },
    },
  },
};

const CLASSIFICATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["primaryCategory", "secondaryCategory", "confidence", "rationale", "reviewFlags"],
  properties: {
    primaryCategory: { type: "string", enum: INVOICE_CATEGORIES },
    secondaryCategory: { type: "string", enum: ["", ...INVOICE_CATEGORIES] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    rationale: { type: "string" },
    reviewFlags: { type: "array", items: { type: "string" } },
  },
};

function extractJsonFromContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      try { return JSON.parse(fenced[1].trim()); } catch { /* fall through */ }
    }
    const braceStart = content.indexOf("{");
    const braceEnd = content.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      try { return JSON.parse(content.slice(braceStart, braceEnd + 1)); } catch { /* fall through */ }
    }
  }
  return null;
}

function parseJsonResponse(message: ChatCompletionMessage | undefined, name: string) {
  if (!message) throw new Error(`Mesh did not return a completion message for ${name}.`);

  // Try tool_calls first (if model supports it)
  const toolCall = message.tool_calls?.find(
    (call) => call.type === "function" && call.function.name === name
  );
  if (toolCall && toolCall.type === "function") {
    try { return JSON.parse(toolCall.function.arguments) as unknown; }
    catch { throw new Error(`Mesh returned malformed JSON for ${name}.`); }
  }

  // Fall back to parsing JSON from plain text content
  const content = typeof message.content === "string" ? message.content : "";
  if (content) {
    const parsed = extractJsonFromContent(content);
    if (parsed !== null) return parsed;
  }

  throw new Error(`Mesh did not return valid JSON for ${name}.`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { text?: unknown; fileName?: unknown; model?: unknown };

    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    const fileName = typeof body.fileName === "string" ? body.fileName : "invoice";
    const model =
      typeof body.model === "string" && body.model.trim()
        ? body.model.trim()
        : process.env.MESH_DEFAULT_MODEL || DEFAULT_MODEL;

    if (!rawText) {
      return NextResponse.json({ error: "No extracted text was provided." }, { status: 400 });
    }

    const limitedText = rawText.slice(0, MAX_TEXT_CHARS);

    // ── Stage 1: Extract structured invoice fields ────────────────────────
    const extractionCompletion = await meshClient.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You extract structured invoice data from noisy OCR or text-extracted PDFs.

RULES:
- Do NOT guess values. If uncertain, return null.
- Product/SKU codes (e.g. 822-79-9581) are NOT prices — never use them as numeric values.
- Prices are always prefixed with a currency symbol (€, $, £, etc.). Extract only those as numbers.
- Each line item typically spans 2 lines:
    Line 1: description + total price (currency-prefixed)
    Line 2: SKU code + quantity + unit price (currency-prefixed)
- Fix OCR spacing artifacts (e.g. "S k id" → "Skid", "9 5 8 1" → "9581").
- Extract SKU into the "sku" field, NOT into "description".
- quantity, unitPrice, and total must be plain numbers (no currency symbols).
- Set valid=false if unitPrice × quantity ≠ total (allow ±0.02 rounding tolerance).
- subtotal, tax, and total at invoice level: extract as numbers if present, otherwise null.
- Return ONLY a valid JSON object matching the schema below. No markdown, no extra text.

SCHEMA:
${JSON.stringify(EXTRACTION_SCHEMA, null, 2)}`,
        },
        {
          role: "user",
          content: JSON.stringify({ fileName, rawText: limitedText }, null, 2),
        },
      ],
    });

    const extractedInvoice = sanitizeExtractedInvoice(
      parseJsonResponse(extractionCompletion.choices[0]?.message, "extract_invoice_fields")
    );

    // ── Stage 2: Classify into accounting bucket ──────────────────────────
    const classificationCompletion = await meshClient.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You classify invoices into accounting buckets. Choose the most defensible category from the provided taxonomy, optionally add a secondary category, include a short rationale, and flag anything that deserves finance review. Respond with a single valid JSON object matching this schema (no markdown, no extra text):\n" +
            JSON.stringify(CLASSIFICATION_SCHEMA, null, 2),
        },
        {
          role: "user",
          content: JSON.stringify({ taxonomy: INVOICE_CATEGORIES, invoice: extractedInvoice }, null, 2),
        },
      ],
    });

    const classification = sanitizeClassification(
      parseJsonResponse(classificationCompletion.choices[0]?.message, "classify_invoice")
    );

    const warnings = summarizeWarnings(extractedInvoice, classification);

    return NextResponse.json({
      uploadedInvoice: { fileName, fileSize: null, mimeType: null },
      extractedInvoice,
      classification,
      warnings,
      model,
      extractedTextPreview: limitedText,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process invoice with MeshAPI.";
    const status = message.includes("malformed JSON") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
