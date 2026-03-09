import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Load E2E environment variables if not already set
if (!process.env.E2E_ADMIN_EMAIL) {
  config({ path: '.env.e2e.local' });
}

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup:admin',
      testMatch: /admin\.setup\.ts/,
    },
    {
      name: 'setup:technician',
      testMatch: /technician\.setup\.ts/,
    },
    {
      name: 'setup:client-pic',
      testMatch: /client-pic\.setup\.ts/,
    },
    {
      name: 'setup:client',
      testMatch: /client\.setup\.ts/,
    },
    {
      name: 'log-sheet:happy-path',
      testMatch: /happy-path\.spec\.ts/,
      dependencies: ['setup:technician'],
      use: {
        storageState: '.auth/technician.json',
      },
    },
    {
      name: 'log-sheet:full-workflow',
      testMatch: /full-workflow\.spec\.ts/,
      dependencies: ['setup:technician'],
      use: {
        storageState: '.auth/technician.json',
      },
    },
    {
      name: 'log-sheet:draft-flow',
      testMatch: /draft-flow\.spec\.ts/,
      dependencies: ['setup:technician'],
      use: {
        storageState: '.auth/technician.json',
      },
    },
    {
      name: 'log-sheet:user-flows',
      testMatch: /user-flows\.spec\.ts/,
      dependencies: ['setup:technician'],
      use: {
        storageState: '.auth/technician.json',
      },
    },
    {
      name: 'log-sheet:validation',
      testMatch: /validation-recovery\.spec\.ts/,
      dependencies: ['setup:technician'],
      use: {
        storageState: '.auth/technician.json',
      },
    },
    {
      name: 'log-sheet:admin',
      testMatch: /admin-override\.spec\.ts/,
      dependencies: ['setup:admin'],
      use: {
        storageState: '.auth/admin.json',
      },
    },
    {
      name: 'log-sheet:approval',
      testMatch: /approval\.spec\.ts/,
      dependencies: ['setup:admin'],
      use: {
        storageState: '.auth/admin.json',
      },
    },
    {
      name: 'log-sheet:print-preview',
      testMatch: /print-preview\.spec\.ts/,
      dependencies: ['setup:technician'],
      use: {
        storageState: '.auth/technician.json',
      },
    },
    {
      name: 'infrastructure',
      testMatch: /infrastructure\/.*\.spec\.ts/,
      dependencies: ['setup:admin', 'setup:technician'],
    },
    {
      name: 'users',
      testMatch: /users\/.*\.spec\.ts/,
      dependencies: ['setup:admin', 'setup:technician'],
    },
    {
      name: 'client-portal',
      testMatch: /client-portal\/.*\.spec\.ts/,
      dependencies: ['setup:client'],
      use: {
        storageState: '.auth/client.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
