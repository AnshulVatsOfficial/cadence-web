import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://52.66.101.231:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;