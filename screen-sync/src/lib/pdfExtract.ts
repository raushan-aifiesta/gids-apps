// Max characters sent to the AI per document (avoids token overflow)
const MAX_CHARS = 20_000;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import keeps pdf-parse-new server-side only
  const PDFParse = (await import("pdf-parse-new")).default;
  const data = await PDFParse(buffer);
  const text = data.text.trim();
  if (text.length <= MAX_CHARS) return text;
  // Preserve head and tail for long documents
  const half = MAX_CHARS / 2;
  return text.slice(0, half) + "\n...[truncated]...\n" + text.slice(-half);
}

export async function extractTextFromFile(
  file: File,
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  // Plain text fallback
  return buffer.toString("utf-8").slice(0, MAX_CHARS);
}
