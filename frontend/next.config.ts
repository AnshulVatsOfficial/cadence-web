import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://13.203.127.165:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
