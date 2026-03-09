import { test, expect } from '@playwright/test';
import { injectRippleEffect } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Admin Review and Approval', async ({ page }) => {
  await injectRippleEffect(page);
  await demoLogin(page, 'ADMIN');

  // Navigate to Operations -> Log Sheets (or specific approval queue)
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const logSheetsLink = page
    .getByRole('link', { name: /log sheet|laporan/i })
    .first();
  try {
    if (await logSheetsLink.isVisible({ timeout: 2000 })) {
      await logSheetsLink.click();
    } else {
      await page.goto('/log-sheets');
    }
  } catch {
    await page.goto('/log-sheets');
  }

  await expect(page).toHaveURL(/\/log-sheets/);
  await page.waitForTimeout(DELAY);

  // Simulate finding a "Pending" log sheet and reviewing it
  // Assuming a generic table row click
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.isVisible()) {
    await firstRow.click();
    await page.waitForTimeout(DELAY);

    // Scroll through the report to let the viewer see the data
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);

    // Simulate signing/approving
    const signaturePad = page.locator('.signature-pad-wrapper').first(); // Guessing a class
    if (await signaturePad.isVisible()) {
      // Draw a fake signature
      const box = await signaturePad.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(box.x + 50, box.y + 50, { steps: 5 });
        await page.mouse.move(box.x + 100, box.y + 20, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(1000);
      }
    }

    const approveBtn = page.getByRole('button', { name: /approve|setuju/i });
    if (await approveBtn.isVisible()) {
      // Don't actually click to save DB state, just hover
      await approveBtn.hover();
    }
  }

  await page.waitForTimeout(DELAY);
});
