import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');

  // If we are already redirected to dashboard/home, we are logged in
  if (page.url().includes('/dashboard') || page.url().includes('/log-sheets')) {
    return;
  }

  const emailInput = page.getByRole('textbox', { name: /email/i });
  if (await emailInput.isVisible()) {
    const passwordInput = page.getByRole('textbox', { name: /password/i });
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill(process.env.E2E_ADMIN_EMAIL ?? 'admin@corintek.test');
    await passwordInput.fill(process.env.E2E_ADMIN_PASSWORD ?? 'password');
    await submitButton.click();
  }

  await expect(page).toHaveURL(/\/(dashboard|my-projects|log-sheets|users|$)/, {
    timeout: 15000,
  });
}

export async function loginAsTechnician(page: Page) {
  await page.goto('/login');

  // If we are already redirected to dashboard/home, we are logged in
  if (page.url().includes('/dashboard') || page.url().includes('/log-sheets')) {
    return;
  }

  const emailInput = page.getByRole('textbox', { name: /email/i });
  if (await emailInput.isVisible()) {
    const passwordInput = page.getByRole('textbox', { name: /password/i });
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill(
      process.env.E2E_TECHNICIAN_EMAIL ?? 'technician@corintek.test'
    );
    await passwordInput.fill(process.env.E2E_TECHNICIAN_PASSWORD ?? 'password');
    await submitButton.click();
  }

  await expect(page).toHaveURL(/\/(dashboard|my-projects|log-sheets|$)/, {
    timeout: 15000,
  });
}
