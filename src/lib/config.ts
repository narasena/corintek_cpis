export const API_CONFIG = {
  WORKER_URL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_WORKER_URL || 'https://corintek-cpis-assets.workers.dev'
    : 'http://localhost:8787',
  AUTH_SECRET: process.env.NEXT_PUBLIC_WORKER_AUTH_SECRET || 'corintek-cpis-2025'
};
