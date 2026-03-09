import { test, expect } from '@playwright/test';
import { injectRippleEffect, typeLikeHuman } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Client Management', async ({ page }) => {
  await injectRippleEffect(page);
  await demoLogin(page, 'ADMIN');

  // Navigate to Master Data -> Clients
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const clientsLink = page.getByRole('link', { name: /client|klien/i }).first();
  try {
    if (await clientsLink.isVisible({ timeout: 2000 })) {
      await clientsLink.click();
    } else {
      await page.goto('/clients');
    }
  } catch {
    await page.goto('/clients');
  }

  await expect(page).toHaveURL(/\/clients/);
  await page.waitForTimeout(DELAY); // Let user view the clients table

  // 3. Create a new Client
  const addBtn = page.getByRole('button', { name: /add|tambah/i });
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await page.waitForTimeout(1000);
  }

  // Generic form filling, assuming standard fields existahaan, Alamat, No. Telp, Email
  const companyInput = page.getByRole('textbox', {
    name: /perusahaan|company/i,
  });
  if (await companyInput.isVisible()) {
    await typeLikeHuman(
      page,
      'input[name="company_name"]',
      'PT. Demo Client Nusantara'
    );
    await page.waitForTimeout(500);

    await typeLikeHuman(
      page,
      'input[name="address"]',
      'Jl. Sudirman No 42, Jakarta'
    );
    await page.waitForTimeout(500);

    await typeLikeHuman(page, 'input[name="phone"]', '+6281234567890');
    await page.waitForTimeout(500);

    await typeLikeHuman(page, 'input[name="email"]', 'contact@democlient.test');
    await page.waitForTimeout(1000);

    // Cancel to keep DB clean
    await page.getByRole('button', { name: /cancel|batal/i }).click();
  }

  await page.waitForTimeout(DELAY);
});
