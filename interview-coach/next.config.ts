import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/interview-coach",
  serverExternalPackages: ["pdf-parse", "mongodb"],
  turbopack: {},
};

export default nextConfig;
