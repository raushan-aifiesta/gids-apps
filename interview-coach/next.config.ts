import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mongodb"],
  turbopack: {},
};

export default nextConfig;
