import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/photos/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  transpilePackages: ["three"],
};

export default nextConfig;
