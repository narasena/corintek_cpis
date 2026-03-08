import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // CG-05: Enable Next.js 16 Cache Components
  cacheComponents: true,
  // Define cache TTL profiles (stale/revalidate in seconds)
  cacheLife: {
    default: {
      stale: 900, // 15 minutes (client-side stale)
      revalidate: 900, // 15 minutes (server-side revalidate)
    },
    short: {
      stale: 60, // 1 minute
      revalidate: 300, // 5 minutes
    },
    hours: {
      stale: 1800, // 30 minutes
      revalidate: 3600, // 1 hour
    },
    days: {
      stale: 3600, // 1 hour
      revalidate: 86400, // 24 hours
    },
    max: {
      stale: 31536000, // 1 year
      revalidate: 31536000,
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
