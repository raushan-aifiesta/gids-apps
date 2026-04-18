import { NextResponse } from "next/server";
import type { LeaderboardEntry } from "@/lib/types";
import type { LeaderboardDocument } from "@/drizzle/schema";

/**
 * In-memory leaderboard store.
 * Lives for the lifetime of the server process — ideal for a booth demo.
 * Swap for MongoDB when persistence is needed (see db.ts + db.health.ts).
 */
const store = new Map<string, LeaderboardDocument>();

// GET — top 20 entries sorted by score
export async function GET() {
  const entries = Array.from(store.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((d) => ({
      _id: d.sessionId,
      sessionId: d.sessionId,
      nickname: d.nickname,
      score: d.score,
      mode: d.mode,
      rank: d.rank,
      questionCount: d.questionCount,
      createdAt: d.createdAt,
    }));

  return NextResponse.json({ entries, dbHealthy: true } satisfies {
    entries: LeaderboardEntry[];
    dbHealthy: boolean;
  });
}

// POST — upsert an entry
export async function POST(req: Request) {
  try {
    const body: LeaderboardDocument = await req.json();

    if (!body.sessionId || !body.nickname || body.score == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    store.set(body.sessionId, {
      sessionId: body.sessionId,
      nickname: body.nickname.slice(0, 50),
      score: body.score,
      mode: body.mode,
      rank: body.rank,
      questionCount: body.questionCount,
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    });

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("[leaderboard/POST] error:", err);
    return NextResponse.json({ saved: false });
  }
}
