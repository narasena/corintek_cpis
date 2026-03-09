import { test, expect } from '@playwright/test';
import { injectRippleEffect } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Client Dashboard and Reports', async ({ page }) => {
  await injectRippleEffect(page);

  // 1. Login Flow (Client)
  await demoLogin(page, 'CLIENT');

  // 2. View Dashboard Charts (Approach/Ampere)
  // Dashboard is default landing page for Client usually
  await page.waitForTimeout(DELAY);

  // Scroll to view charts
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(DELAY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(DELAY);

  // 3. Navigate to Summary Reports
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const reportsLink = page
    .getByRole('link', { name: /summary|ringkasan/i })
    .first();
  try {
    if (await reportsLink.isVisible({ timeout: 2000 })) {
      await reportsLink.click();
    } else {
      await page.goto('/summary-reports');
    }
  } catch {
    await page.goto('/summary-reports');
  }

  // 4. View a Summary Report
  const firstReport = page.locator('tbody tr').first();
  if (await firstReport.isVisible()) {
    await firstReport.click();
    await page.waitForTimeout(DELAY);

    // Scroll through executive summary
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1000);

    // Look at attachments/PDF section
    const attachTab = page.getByRole('tab', { name: /attachment|lampiran/i });
    if (await attachTab.isVisible()) {
      await attachTab.click();
      await page.waitForTimeout(DELAY);
    }
  }

  await page.waitForTimeout(DELAY);
});
