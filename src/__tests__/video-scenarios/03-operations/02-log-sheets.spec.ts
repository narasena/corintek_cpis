import { test, expect } from '@playwright/test';
import { injectRippleEffect, typeLikeHuman } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Technician Log Sheet Data Entry', async ({ page }) => {
  await injectRippleEffect(page);
  await demoLogin(page, 'TECHNICIAN');

  // Navigate to Operations -> Log Sheets
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

  // Create new Log Sheet
  const addBtn = page.getByRole('button', { name: /add|tambah/i });
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await page.waitForTimeout(1000);
  }

  // FSD Log Sheet: Select Project & Unit Type
  // Since we don't have a specific UI, we'll try to find common combo boxes or selects
  const projectSelect = page.locator('select').first();
  if (await projectSelect.isVisible()) {
    // Usually, we'd pick a project here
    // await projectSelect.selectOption({ index: 1 });
    await page.waitForTimeout(500);
  }

  // Simulate picking "Condenser"
  const condenserBtn = page.getByText(/condenser/i);
  if (await condenserBtn.isVisible()) {
    await condenserBtn.click();
    await page.waitForTimeout(1000);

    // FSD Data: Temp In, Temp Out, Saturated Temp, Approach, Load Demand
    const inputs = [
      { name: 'temp_in', val: '28.5' },
      { name: 'temp_out', val: '32.1' },
    ];

    for (const input of inputs) {
      const field = page.locator(`input[name*="${input.name}"]`).first();
      if (await field.isVisible()) {
        await typeLikeHuman(page, `input[name*="${input.name}"]`, input.val);
      }
    }

    await page.waitForTimeout(1000);

    // Simulate saving as Draft
    const draftBtn = page.getByRole('button', { name: /draft/i });
    if (await draftBtn.isVisible()) {
      await draftBtn.click();
    } else {
      // Cancel to keep DB clean if no draft button
      const cancelBtn = page.getByRole('button', { name: /cancel|batal/i });
      if (await cancelBtn.isVisible()) await cancelBtn.click();
    }
  }

  await page.waitForTimeout(DELAY);
});
