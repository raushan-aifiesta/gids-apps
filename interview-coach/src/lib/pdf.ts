/**
 * Server-side PDF text extraction.
 * Uses pdf-parse (same dep as resume-builder's documentExtract.ts).
 */

const MAX_CHARS = 12_000;

export async function extractTextFromPdfBuffer(
  buffer: Buffer,
): Promise<string> {
  // Dynamic import avoids issues with Next.js edge runtime
  const PDFParser = (await import("pdf-parse")).default;
  const data = await PDFParser(buffer);
  return data.text.slice(0, MAX_CHARS).trim();
}
