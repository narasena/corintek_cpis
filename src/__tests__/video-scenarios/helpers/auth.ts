import { Page } from '@playwright/test';
import { typeLikeHuman } from './visual';

export type DemoRole = 'ADMIN' | 'TECHNICIAN' | 'CLIENT';

const ROLE_CREDENTIALS: Record<
  DemoRole,
  { emailEnv: string; defaultEmail: string; passEnv: string }
> = {
  ADMIN: {
    emailEnv: 'E2E_ADMIN_EMAIL',
    defaultEmail: 'admin@corintek.test',
    passEnv: 'E2E_ADMIN_PASSWORD',
  },
  TECHNICIAN: {
    emailEnv: 'E2E_TECHNICIAN_EMAIL',
    defaultEmail: 'technician@corintek.test',
    passEnv: 'E2E_TECHNICIAN_PASSWORD',
  },
  CLIENT: {
    emailEnv: 'E2E_CLIENT_EMAIL',
    defaultEmail: 'client@client.test',
    passEnv: 'E2E_CLIENT_PASSWORD',
  },
};

/**
 * Standardized human-like login flow for video demonstrations.
 * @param page Playwright Page object
 * @param role The role to log in as (ADMIN, TECHNICIAN, CLIENT)
 */
export async function demoLogin(page: Page, role: DemoRole) {
  const creds = ROLE_CREDENTIALS[role];
  const email = process.env[creds.emailEnv] ?? creds.defaultEmail;
  const password = process.env[creds.passEnv] ?? 'password';

  await page.goto('/login');
  await page.waitForTimeout(2000); // Let viewer see the login page

  await typeLikeHuman(page, 'input[name="email"]', email);
  await page.waitForTimeout(500);

  await typeLikeHuman(page, 'input[name="password"]', password);
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for dashboard to load successfully by checking we left the login page
  try {
    await page.waitForURL('**/!(login)', { timeout: 8000 });
  } catch {
    console.warn(
      `[Video Gen] Timeout waiting for login redirect. Current URL: ${page.url()}`
    );
  }

  await page.waitForTimeout(2000); // Viewer sees the landing page
}
