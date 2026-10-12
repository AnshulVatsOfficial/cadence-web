import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://cadence-api-42rj.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
