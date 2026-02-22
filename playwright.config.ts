import { defineConfig, devices } from '@playwright/test';

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
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
