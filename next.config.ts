import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'media.instacdn.live',
        pathname: '*',
      },
    ],
    domains: ['media.instacdn.live'],
  },
  /* config options here */
};

export default nextConfig;
