import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { uploadJsonToGCS } from "@/lib/gcs";
import { WHY_AI_OPTIONS, TOKENS_OPTIONS } from "@/lib/contact";

const schema = z.object({
  name: z.string().min(1).max(200).trim(),
  email: z.string().email().max(320),
  company: z.string().max(200).trim().optional().or(z.literal("")),
  why: z.enum(WHY_AI_OPTIONS).optional(),
  tokens: z.enum(TOKENS_OPTIONS).optional(),
  referrer: z.string().max(2048).optional(),
});

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

    const submittedAt = new Date().toISOString();
    const lead = {
      ...parsed.data,
      company: parsed.data.company || undefined,
      submittedAt,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for") ?? undefined,
    };

    const safeTimestamp = submittedAt.replace(/[:.]/g, "-");
    const destPath = `leads/${safeTimestamp}-${nanoid(8)}.json`;

    await uploadJsonToGCS(lead, destPath);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Contact submission failed" },
      { status: 500 },
    );
  }
}
