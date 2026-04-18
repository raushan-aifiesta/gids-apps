import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { extractTextFromPdfBuffer } from "@/lib/pdf";
import { uploadToGCS } from "@/lib/gcs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text for AI skill parsing
    const text = await extractTextFromPdfBuffer(buffer);

    // Upload to GCS in background (non-blocking for the interview flow)
    let gcsUrl: string | null = null;
    try {
      const id = nanoid(10);
      const destPath = `interview-coach/resumes/${id}.pdf`;
      gcsUrl = await uploadToGCS(buffer, destPath, "application/pdf");
    } catch (gcsErr) {
      // GCS upload failure is non-fatal — we still have the extracted text
      console.warn("[upload] GCS upload failed:", gcsErr);
    }

    return NextResponse.json({ text, charCount: text.length, gcsUrl });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 },
    );
  }
}
