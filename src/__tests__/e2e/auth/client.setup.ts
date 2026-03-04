import { test as setup, expect } from '@playwright/test';

/**
 * CP-01: Client Portal Auth Setup
 * Authenticates as a CLIENT role user for read-only portal tests
 */

const AUTH_FILE = '.auth/client.json';

setup('authenticate as client', async ({ page }) => {
  await page.goto('/login');

  const emailInput = page.getByRole('textbox', { name: /email/i });
  const passwordInput = page.getByRole('textbox', { name: /password/i });
  const submitButton = page.getByRole('button', { name: /sign in/i });

  await emailInput.fill(process.env.E2E_CLIENT_EMAIL ?? 'client@client.test');
  await passwordInput.fill(process.env.E2E_CLIENT_PASSWORD ?? 'password');

  await submitButton.click();

  await expect(page).toHaveURL(/\/(dashboard|my-projects|$)/, {
    timeout: 10000,
  });

  await page.context().storageState({ path: AUTH_FILE });
});
