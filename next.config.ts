import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cpis-corintek.workers.dev',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
