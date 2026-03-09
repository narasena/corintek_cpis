import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Load E2E environment variables
if (!process.env.E2E_ADMIN_EMAIL) {
  config({ path: '.env.e2e.local' });
}

export default defineConfig({
  testDir: './src/__tests__/video-scenarios',
  fullyParallel: false,
  workers: 1, // Keep execution ordered for videos
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    video: 'on',
    launchOptions: {
      slowMo: 800, // Make actions human readable
    },
  },
  projects: [
    {
      name: 'video-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        video: {
          mode: 'on',
          size: { width: 1920, height: 1080 },
        },
      },
    },
    {
      name: 'video-mobile',
      use: {
        ...devices['Pixel 5'],
        video: {
          mode: 'on',
          size: { width: 393, height: 851 }, // Native Pixel 5 CSS dimensions
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
