import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/guess-my-salary",
  serverExternalPackages: ["apify-client", "proxy-agent"],
};

export default nextConfig;
