import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/guess-my-salary",
  serverExternalPackages: ["apify-client", "proxy-agent", "@react-pdf/renderer"],
};

export default nextConfig;
