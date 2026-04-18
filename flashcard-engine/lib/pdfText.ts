// Client-side PDF text extraction using pdfjs-dist (browser only).
// Falls back to Tesseract.js OCR for scanned/image-based PDFs.

export const MAX_CHARS = 24000;

/** Whether the extracted text came from OCR (scanned PDF) vs embedded text. */
export type ExtractionMethod = "text" | "ocr";

export interface PdfExtractionResult {
  text: string;
  totalPages: number;
  truncated: boolean;
  method: ExtractionMethod;
}

// ── Step 1: pdfjs embedded-text extraction ────────────────────────────────────

async function extractEmbeddedText(
  arrayBuffer: ArrayBuffer,
  startPage: number,
  endPage: number
): Promise<{ pageTexts: string[]; totalPages: number }> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const end = Math.min(endPage, totalPages);
  const pageTexts: string[] = [];

  for (let pageNum = startPage; pageNum <= end; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (pageText) pageTexts.push(pageText);
  }

  return { pageTexts, totalPages };
}

// ── Step 2: Tesseract.js OCR fallback (scanned PDFs) ─────────────────────────

async function ocrPdfPages(
  arrayBuffer: ArrayBuffer,
  startPage: number,
  endPage: number,
  totalPages: number
): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const { createWorker } = await import("tesseract.js");
  const ocrWorker = await createWorker("eng");

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const end = Math.min(endPage, totalPages);
  const pageTexts: string[] = [];

  for (let pageNum = startPage; pageNum <= end; pageNum++) {
    const page = await pdf.getPage(pageNum);
    // Render to a canvas at 2× scale for better OCR accuracy
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    const { data } = await ocrWorker.recognize(blob);
    const cleaned = data.text
      .replace(/\n{2,}/g, "\n")
      .replace(/[^\x00-\x7F]/g, "") // strip non-ASCII artifacts
      .trim();

    if (cleaned) pageTexts.push(cleaned);
  }

  await ocrWorker.terminate();
  return pageTexts;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function extractTextFromPdf(
  file: File,
  pageRange?: { start: number; end: number }
): Promise<PdfExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  // First pass: use pdfjs to get total page count quickly
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const pdfMeta = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const totalPages = pdfMeta.numPages;

  const startPage = pageRange?.start ?? 1;
  const endPage = pageRange?.end ?? totalPages;

  // Attempt embedded text extraction
  const { pageTexts } = await extractEmbeddedText(
    arrayBuffer.slice(0),
    startPage,
    endPage
  );

  let method: ExtractionMethod = "text";
  let finalTexts = pageTexts;

  // If pdfjs found no text, fall back to Tesseract OCR
  if (finalTexts.length === 0) {
    method = "ocr";
    finalTexts = await ocrPdfPages(
      arrayBuffer.slice(0),
      startPage,
      endPage,
      totalPages
    );
  }

  if (finalTexts.length === 0) {
    throw new Error(
      "Could not extract any text from this PDF — even after OCR. " +
        "Please ensure the file contains readable content."
    );
  }

  const fullText = finalTexts.join("\n\n").trim();
  const truncated = fullText.length > MAX_CHARS;

  return {
    text: fullText.slice(0, MAX_CHARS),
    totalPages,
    truncated,
    method,
  };
}
