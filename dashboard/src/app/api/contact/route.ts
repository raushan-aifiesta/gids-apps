import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WHY_AI_OPTIONS, TOKENS_OPTIONS } from "@/lib/contact";

const idSchema = z.string().uuid();

// Every field is optional. Partial data is intentionally allowed so we can
// store drafts as the user types. Empty strings are normalised to null.
const schema = z.object({
  id: idSchema.optional(),
  name: z.string().max(200).optional().or(z.literal("")),
  email: z.string().max(320).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  why: z.enum(WHY_AI_OPTIONS).optional(),
  tokens: z.enum(TOKENS_OPTIONS).optional(),
  referrer: z.string().max(2048).optional(),
});

function inferSource(referer: string | null): string {
  if (!referer) return "dashboard";
  try {
    const url = new URL(referer);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "apps" && parts[1]) {
      return `apps/${parts[1]}`;
    }
    return "dashboard";
  } catch {
    return "dashboard";
  }
}

function blankToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id, ...data } = parsed.data;
    const source = inferSource(req.headers.get("referer"));
    const userAgent = req.headers.get("user-agent") ?? null;
    const ipHeader = req.headers.get("x-forwarded-for");
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;

    // Email validation only applies if email is non-empty (partial drafts allowed)
    const emailValue = blankToNull(data.email);
    if (emailValue) {
      const emailOk = z.string().email().safeParse(emailValue).success;
      if (!emailOk) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
    }

    const supabase = getSupabaseAdmin();

    if (id) {
      // Update existing draft — only set fields present on this call so
      // later calls can't clobber previously-captured values with blanks.
      const update: Record<string, unknown> = { source, user_agent: userAgent, ip };
      if (data.name !== undefined) update.name = blankToNull(data.name);
      if (data.email !== undefined) update.email = emailValue;
      if (data.phone !== undefined) update.phone = blankToNull(data.phone);
      if (data.company !== undefined) update.company = blankToNull(data.company);
      if (data.why !== undefined) update.why = data.why;
      if (data.tokens !== undefined) update.tokens = data.tokens;
      if (data.referrer !== undefined) update.referrer = blankToNull(data.referrer);

      const { error } = await supabase.from("leads").update(update).eq("id", id);

      if (error) {
        console.error("[/api/contact] supabase update error:", error);
        return NextResponse.json({ error: "Could not save submission" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id });
    }

    // Insert a fresh row
    const row = {
      name: blankToNull(data.name),
      email: emailValue,
      phone: blankToNull(data.phone),
      company: blankToNull(data.company),
      why: data.why ?? null,
      tokens: data.tokens ?? null,
      referrer: blankToNull(data.referrer),
      source,
      user_agent: userAgent,
      ip,
    };

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert(row)
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[/api/contact] supabase insert error:", error);
      return NextResponse.json({ error: "Could not save submission" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (err) {
    console.error("[/api/contact] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Contact submission failed" },
      { status: 500 },
    );
  }
}
