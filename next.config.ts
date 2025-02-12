import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'phpstack-1409678-5243790.cloudwaysapps.com',
        pathname: '*',
      },

    ],
    domains: ['phpstack-1409678-5243790.cloudwaysapps.com'],
  },
  /* config options here */
};

export default nextConfig;
