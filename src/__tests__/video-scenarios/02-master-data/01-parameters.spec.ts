import { test, expect } from '@playwright/test';
import { injectRippleEffect, typeLikeHuman } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Admin Parameter Limits Management', async ({ page }) => {
  await injectRippleEffect(page);

  // 1. Login Flow (Admin)
  await demoLogin(page, 'ADMIN');

  // 2. Navigate to Master Data -> Parameters
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const paramsLink = page.getByRole('link', { name: /parameter/i }).first();
  try {
    if (await paramsLink.isVisible({ timeout: 2000 })) {
      await paramsLink.click();
    } else {
      await page.goto('/parameters');
    }
  } catch {
    await page.goto('/parameters');
  }

  await expect(page).toHaveURL(/\/parameters/);
  await page.waitForTimeout(DELAY); // Let user view the parameters table

  // 3. Create a new Parameter Profile
  const addBtn = page.getByRole('button', { name: /add|tambah/i });
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await page.waitForTimeout(1000);
  }

  // Note: The specific fields depend on the actual UI implementation,
  // but we simulate creating a profile for "Standard Cooling Tower"
  const nameInput = page.getByRole('textbox', { name: /name|nama/i });
  if (await nameInput.isVisible()) {
    await typeLikeHuman(
      page,
      'input[name="name"]',
      'Demo: Standard Cooling Tower Limits'
    );
    await page.waitForTimeout(500);

    // Simulate filling out a couple of limits just to show the UX
    await typeLikeHuman(page, 'input[name="ph_min"]', '6.5');
    await typeLikeHuman(page, 'input[name="ph_max"]', '8.5');
    await page.waitForTimeout(1000);

    // We won't actually submit to keep DB clean, just demonstrate
    await page.getByRole('button', { name: /cancel|batal/i }).click();
  }

  await page.waitForTimeout(DELAY);
});
