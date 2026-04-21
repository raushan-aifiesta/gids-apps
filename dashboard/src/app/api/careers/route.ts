import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = "resumes";

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 120);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const linkedinUrl = String(form.get("linkedinUrl") ?? "").trim();
    const role = String(form.get("role") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const resume = form.get("resume");

    if (!name || !email || !linkedinUrl || !(resume instanceof File)) {
      return NextResponse.json(
        { error: "name, email, linkedinUrl, and resume PDF are required" },
        { status: 400 },
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    try {
      new URL(linkedinUrl);
    } catch {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
    }

    if (resume.size === 0) {
      return NextResponse.json({ error: "Resume file is empty" }, { status: 400 });
    }
    if (resume.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "Resume must be under 10 MB" }, { status: 400 });
    }

    const isPdf =
      resume.type === "application/pdf" ||
      resume.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Resume must be a PDF" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Upload the PDF to the `resumes` bucket
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const storagePath = `applications/${ts}-${crypto.randomUUID()}-${safeName(resume.name)}`;
    const buffer = Buffer.from(await resume.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("[/api/careers] upload error:", uploadError);
      return NextResponse.json(
        { error: "Could not upload resume" },
        { status: 500 },
      );
    }

    // Insert the application record
    const userAgent = req.headers.get("user-agent") ?? null;
    const ipHeader = req.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;

    const { data: inserted, error: insertError } = await supabase
      .from("applications")
      .insert({
        name,
        email,
        linkedin_url: linkedinUrl,
        role: role || null,
        message: message || null,
        resume_storage_path: storagePath,
        resume_filename: resume.name,
        user_agent: userAgent,
        ip,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      // Best-effort: try to clean up the orphaned resume file
      void supabase.storage.from(BUCKET).remove([storagePath]);
      console.error("[/api/careers] insert error:", insertError);
      return NextResponse.json(
        { error: "Could not save application" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (err) {
    console.error("[/api/careers] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Application failed" },
      { status: 500 },
    );
  }
}
