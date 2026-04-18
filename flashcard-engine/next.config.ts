import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "mammoth",
    "@react-pdf/renderer",
    "@google-cloud/storage",
    "pdf-parse",
    "apify-client",
  ],
};

export default nextConfig;
