import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/apps/mesh-app-builder",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
  },
};

export default nextConfig;
