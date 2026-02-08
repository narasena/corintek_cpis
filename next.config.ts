import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
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
