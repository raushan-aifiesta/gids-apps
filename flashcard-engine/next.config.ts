import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/flashcard-engine",
  serverExternalPackages: [
    "mammoth",
    "@react-pdf/renderer",
    "@google-cloud/storage",
    "pdf-parse",
    "apify-client",
  ],
};

export default nextConfig;
