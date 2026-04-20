import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/screen-sync",
  serverExternalPackages: ["pdf-parse-new", "@google-cloud/storage", "apify-client"],
};

export default nextConfig;
