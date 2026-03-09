import { test, expect } from '@playwright/test';
import { injectRippleEffect } from './helpers/visual';
import { demoLogin } from './helpers/auth';

// Run sequentially to keep DB state clean
test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Admin Login and User Management', async ({ page }) => {
  await injectRippleEffect(page);

  // 1. Login Flow (Admin)
  await demoLogin(page, 'ADMIN');

  // 2. Navigate to Users List
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const usersLink = page.getByRole('link', { name: /users|pengguna/i }).first();
  try {
    if (await usersLink.isVisible({ timeout: 2000 })) {
      await usersLink.click();
    } else {
      await page.goto('/users'); // Fallback direct navigation
    }
  } catch {
    await page.goto('/users');
  }

  await expect(page).toHaveURL(/\/users/);
  await page.waitForTimeout(DELAY); // Read the users list

  // 3. View own profile
  const profileMenu = page
    .getByRole('button', { name: /(admin|profile)/i })
    .last();
  try {
    if (await profileMenu.isVisible({ timeout: 2000 })) {
      await profileMenu.click();
      await page.waitForTimeout(1000);
      await page
        .getByRole('menuitem', { name: /profile|my account|akun/i })
        .click();

      await expect(page).toHaveURL(/\/profile/);
      await page.waitForTimeout(DELAY * 2); // Final lingering shot of profile
    }
  } catch {}
});

test('System Demo: Client Login and Restricted View', async ({ page }) => {
  await injectRippleEffect(page);

  // 1. Login Flow (Client)
  await demoLogin(page, 'CLIENT');

  // Attempt to view profile
  const profileMenu = page
    .getByRole('button', { name: /(client|profile)/i })
    .last();
  try {
    if (await profileMenu.isVisible({ timeout: 2000 })) {
      await profileMenu.click();
      await page.waitForTimeout(1000);

      const profileLink = page.getByRole('menuitem', {
        name: /profile|my account|akun/i,
      });
      if (await profileLink.isVisible({ timeout: 2000 })) {
        await profileLink.click();
        await expect(page).toHaveURL(/\/profile/);
        await page.waitForTimeout(DELAY * 2);
      }
    }
  } catch {}
});
