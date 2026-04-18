import type { NextConfig } from "next";

const SUBAPPS = [
  { path: "chat-app",            envKey: "NEXT_PUBLIC_CHAT_APP_DEPLOYMENT",        devPort: 4001 },
  { path: "guess-my-salary",     envKey: "NEXT_PUBLIC_SALARY_DEPLOYMENT",          devPort: 4002 },
  { path: "resume-builder",      envKey: "NEXT_PUBLIC_RESUME_DEPLOYMENT",          devPort: 4003 },
  { path: "flashcard-engine",    envKey: "NEXT_PUBLIC_FLASHCARD_DEPLOYMENT",       devPort: 4004 },
  { path: "will-ai-take-my-job", envKey: "NEXT_PUBLIC_WILL_AI_DEPLOYMENT",         devPort: 4005 },
  { path: "interview-coach",     envKey: "NEXT_PUBLIC_INTERVIEW_COACH_DEPLOYMENT", devPort: 4006 },
  { path: "invoice-processor",   envKey: "NEXT_PUBLIC_INVOICE_DEPLOYMENT",         devPort: 4007 },
  { path: "screen-sync",         envKey: "NEXT_PUBLIC_SCREEN_SYNC_DEPLOYMENT",     devPort: 4008 },
] as const;

function originFor(envKey: string, devPort: number): string {
  if (process.env.NODE_ENV === "production") {
    const value = process.env[envKey];
    if (!value) {
      throw new Error(
        `[dashboard] Missing required env var ${envKey} for multi-zone rewrites`,
      );
    }
    return value.replace(/\/+$/, "");
  }
  return `http://localhost:${devPort}`;
}

const nextConfig: NextConfig = {
  async rewrites() {
    return SUBAPPS.flatMap(({ path, envKey, devPort }) => {
      const origin = originFor(envKey, devPort);
      return [
        { source: `/${path}`,        destination: `${origin}/${path}` },
        { source: `/${path}/:path*`, destination: `${origin}/${path}/:path*` },
      ];
    });
  },
};

export default nextConfig;
