import type { NextConfig } from "next";

const SUBAPPS = [
  { path: "apps/chat-app",            envKey: "NEXT_PUBLIC_CHAT_APP_DEPLOYMENT",        devPort: 4001 },
  { path: "apps/guess-my-salary",     envKey: "NEXT_PUBLIC_SALARY_DEPLOYMENT",          devPort: 4002 },
  { path: "apps/resume-builder",      envKey: "NEXT_PUBLIC_RESUME_DEPLOYMENT",          devPort: 4003 },
  { path: "apps/flashcard-engine",    envKey: "NEXT_PUBLIC_FLASHCARD_DEPLOYMENT",       devPort: 4004 },
  { path: "apps/will-ai-take-my-job", envKey: "NEXT_PUBLIC_WILL_AI_DEPLOYMENT",         devPort: 4005 },
  { path: "apps/interview-coach",     envKey: "NEXT_PUBLIC_INTERVIEW_COACH_DEPLOYMENT", devPort: 4006 },
  { path: "apps/invoice-processor",   envKey: "NEXT_PUBLIC_INVOICE_DEPLOYMENT",         devPort: 4007 },
  { path: "apps/screen-sync",         envKey: "NEXT_PUBLIC_SCREEN_SYNC_DEPLOYMENT",     devPort: 4008 },
] as const;

// In prod, missing env var → skip this sub-app's rewrites (its card 404s until the var is set).
// This lets dashboard deploy before every sub-app is up.
function originFor(envKey: string, devPort: number): string | null {
  if (process.env.NODE_ENV === "production") {
    const value = process.env[envKey];
    if (!value) {
      console.warn(
        `[dashboard] ${envKey} not set — skipping rewrite. Set it to the sub-app's Vercel origin once deployed.`,
      );
      return null;
    }
    return value.replace(/\/+$/, "");
  }
  return `http://localhost:${devPort}`;
}

const nextConfig: NextConfig = {
  async rewrites() {
    return SUBAPPS.flatMap(({ path, envKey, devPort }) => {
      const origin = originFor(envKey, devPort);
      if (!origin) return [];
      return [
        { source: `/${path}`,        destination: `${origin}/${path}` },
        { source: `/${path}/:path*`, destination: `${origin}/${path}/:path*` },
      ];
    });
  },
};

export default nextConfig;
