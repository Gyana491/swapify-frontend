import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'phpstack-1490755-5685488.cloudwaysapps.com',
      },
      {
        protocol: 'http',
        hostname: 'phpstack-1490755-5685488.cloudwaysapps.com',
      },
      {
        protocol: 'https',
        hostname: 'phpstack-1409678-5243790.cloudwaysapps.com',
      },
      {
        protocol: 'http',
        hostname: 'phpstack-1409678-5243790.cloudwaysapps.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
  /* config options here */
};

export default nextConfig;
