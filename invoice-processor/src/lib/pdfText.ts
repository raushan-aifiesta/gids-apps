import { inflateSync } from "node:zlib";

function decodePdfString(value: string) {
  return value
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

function extractLiteralStrings(segment: string) {
  const values: string[] = [];
  let current = "";
  let depth = 0;

  for (let index = 0; index < segment.length; index += 1) {
    const char = segment[index];
    const previous = segment[index - 1];

    if (char === "(" && previous !== "\\") {
      depth += 1;
      if (depth === 1) {
        current = "";
        continue;
      }
    }

    if (char === ")" && previous !== "\\") {
      if (depth === 1) {
        values.push(decodePdfString(current));
        current = "";
      }
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth >= 1) {
      current += char;
    }
  }

  return values;
}

function extractHexStrings(segment: string) {
  const matches = segment.match(/<([0-9A-Fa-f\s]+)>/g) ?? [];

  return matches
    .map((match) => match.slice(1, -1).replace(/\s+/g, ""))
    .filter((value) => value.length >= 2 && value.length % 2 === 0)
    .map((hex) => Buffer.from(hex, "hex").toString("utf8"));
}

function normalizeText(value: string) {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function streamToText(stream: Buffer) {
  const source = normalizeText(stream.toString("latin1"));
  const segments: string[] = [];
  const textBlocks = source.match(/BT[\s\S]*?ET/g) ?? [];

  for (const block of textBlocks) {
    const operatorMatches = block.match(/(\[[\s\S]*?\]\s*TJ|\([^)]*(?:\\.[^)]*)*\)\s*Tj|<[\dA-Fa-f\s]+>\s*Tj)/g) ?? [];
    const pieces: string[] = [];

    for (const operator of operatorMatches) {
      pieces.push(...extractLiteralStrings(operator));
      pieces.push(...extractHexStrings(operator));
    }

    const combined = normalizeText(pieces.join(" "));
    if (combined) segments.push(combined);
  }

  if (segments.length > 0) {
    return segments.join("\n");
  }

  return "";
}

export function extractTextFromPdfBuffer(buffer: Buffer) {
  const textSegments: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(buffer.toString("latin1"))) !== null) {
    const rawSegment = match[1];
    const rawBuffer = Buffer.from(rawSegment, "latin1");
    const candidates = [rawBuffer];

    try {
      candidates.push(inflateSync(rawBuffer));
    } catch {
      // Leave uncompressed streams as-is.
    }

    for (const candidate of candidates) {
      const text = streamToText(candidate);
      if (text) textSegments.push(text);
    }
  }

  const joined = normalizeText(textSegments.join("\n"));

  if (!joined) {
    throw new Error(
      "No extractable text was found in this PDF. MVP1 supports text-based PDFs only, so scanned invoices are not supported yet."
    );
  }

  return joined;
}
