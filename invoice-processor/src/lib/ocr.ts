import { createWorker } from "tesseract.js";

export type OcrProgressCallback = (stage: string, progress: number) => void;

/** Run Tesseract OCR on an ImageBitmap or canvas */
async function ocrCanvas(
  canvas: HTMLCanvasElement,
  onProgress: OcrProgressCallback
): Promise<string> {
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress("Reading text", m.progress);
      }
    },
  });

  const { data } = await worker.recognize(canvas);
  await worker.terminate();
  return data.text;
}

/** Convert a PDF page to a canvas using pdf.js */
async function pdfPageToCanvas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfPage: any,
  scale = 2
): Promise<HTMLCanvasElement> {
  const viewport = pdfPage.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await pdfPage.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

/** Extract text from a PDF file via pdf.js rendering + Tesseract OCR */
async function ocrPdf(file: File, onProgress: OcrProgressCallback): Promise<string> {
  // Lazy-load pdfjs-dist so it's only bundled when needed
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress(`Scanning page ${i} of ${numPages}`, (i - 1) / numPages);

    const page = await pdf.getPage(i);

    // Try native text layer first (fast, accurate for digital PDFs)
    const textContent = await page.getTextContent();
    const nativeText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (nativeText.length > 50) {
      // Digital PDF — native text is good enough
      pageTexts.push(nativeText);
    } else {
      // Scanned page — fall back to Tesseract
      const canvas = await pdfPageToCanvas(page);
      const ocrText = await ocrCanvas(canvas, (stage, p) =>
        onProgress(`Page ${i}/${numPages}: ${stage}`, ((i - 1) + p) / numPages)
      );
      pageTexts.push(ocrText);
    }
  }

  return pageTexts.join("\n\n");
}

/** Extract text from an image file via Tesseract OCR */
async function ocrImage(file: File, onProgress: OcrProgressCallback): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  return ocrCanvas(canvas, onProgress);
}

const PDF_TYPES = new Set(["application/pdf"]);
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/tiff"]);

export function isSupported(file: File) {
  return (
    PDF_TYPES.has(file.type) ||
    IMAGE_TYPES.has(file.type) ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function isPdf(file: File) {
  return PDF_TYPES.has(file.type) || file.name.toLowerCase().endsWith(".pdf");
}

/** Main entry point: extract text from PDF or image via browser OCR */
export async function extractTextFromFile(
  file: File,
  onProgress: OcrProgressCallback
): Promise<string> {
  if (isPdf(file)) {
    return ocrPdf(file, onProgress);
  }
  if (IMAGE_TYPES.has(file.type)) {
    onProgress("Preparing image", 0);
    return ocrImage(file, onProgress);
  }
  throw new Error("Unsupported file type. Please upload a PDF or image.");
}
