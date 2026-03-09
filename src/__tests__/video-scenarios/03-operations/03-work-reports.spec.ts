import { test, expect } from '@playwright/test';
import { injectRippleEffect, typeLikeHuman } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Technician Ad-hoc Work Report', async ({ page }) => {
  await injectRippleEffect(page);
  await demoLogin(page, 'TECHNICIAN');

  // Navigate to Operations -> Work Reports
  // (Assuming it might be under Log Sheets in UI, but we'll try direct path)
  await page.goto('/work-reports');
  await page.waitForTimeout(DELAY);

  // Create new Work Report
  const addBtn = page.getByRole('button', { name: /add|tambah/i });
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await page.waitForTimeout(1000);

    // FSD Work Report: Situasi saat ini, Pekerjaan yang dilakukan, Hasil Pekerjaan
    const extAreas = [
      {
        name: 'current_situation',
        val: 'Water pressure low in Zone A cooling tower.',
      },
      {
        name: 'work_done',
        val: 'Flushed pipes and cleaned the main intake filter.',
      },
      { name: 'result', val: 'Pressure restored to normal parameters.' },
    ];

    for (const area of extAreas) {
      const field = page.locator(`textarea[name*="${area.name}"]`).first();
      if (await field.isVisible()) {
        // typeLikeHuman works on textareas too normally if we update the selector string assumption
        await field.click();
        await field.fill('');
        await field.pressSequentially(area.val, { delay: 50 });
      }
    }

    await page.waitForTimeout(2000);

    // Return to main list
    const cancelBtn = page.getByRole('button', { name: /cancel|batal/i });
    if (await cancelBtn.isVisible()) await cancelBtn.click();
  }

  await page.waitForTimeout(DELAY);
});
