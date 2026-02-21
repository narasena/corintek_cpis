import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = '.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');

  const emailInput = page.getByRole('textbox', { name: /email/i });
  const passwordInput = page.getByRole('textbox', { name: /password/i });
  const submitButton = page.getByRole('button', { name: /sign in/i });

  await emailInput.fill(process.env.E2E_ADMIN_EMAIL ?? 'admin@corintek.test');
  await passwordInput.fill(process.env.E2E_ADMIN_PASSWORD ?? 'password');

  await submitButton.click();

  await expect(page).toHaveURL(/\/(dashboard|my-projects|log-sheets)/, {
    timeout: 10000,
  });

  await page.context().storageState({ path: AUTH_FILE });
});
