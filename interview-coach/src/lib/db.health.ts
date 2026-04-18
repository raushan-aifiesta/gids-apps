/**
 * MongoDB health-check utility.
 * The Leaderboard feature gates itself behind this check —
 * no DB → no leaderboard (graceful degradation, not crash).
 */

import { getDb } from "./db";

export interface DbHealthStatus {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

let cachedStatus: DbHealthStatus | null = null;
let cacheExpiresAt = 0;

const CACHE_TTL_MS = 30_000; // re-check every 30 s

export async function checkDbHealth(
  bustCache = false,
): Promise<DbHealthStatus> {
  const now = Date.now();

  if (!bustCache && cachedStatus && now < cacheExpiresAt) {
    return cachedStatus;
  }

  const start = now;
  try {
    const db = await getDb();
    // ping command is the official lightweight health-check
    await db.command({ ping: 1 });

    const status: DbHealthStatus = {
      healthy: true,
      latencyMs: Date.now() - start,
    };
    cachedStatus = status;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return status;
  } catch (err) {
    const status: DbHealthStatus = {
      healthy: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown DB error",
    };
    // Cache failures for a shorter window so we recover quickly
    cachedStatus = status;
    cacheExpiresAt = Date.now() + 5_000;
    return status;
  }
}
