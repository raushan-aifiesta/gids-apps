import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/resume-builder",
  serverExternalPackages: [
    "mammoth",
    "@react-pdf/renderer",
    "@google-cloud/storage",
    "pdf-parse",
    "apify-client",
    "proxy-agent",
  ],
};

export default nextConfig;
