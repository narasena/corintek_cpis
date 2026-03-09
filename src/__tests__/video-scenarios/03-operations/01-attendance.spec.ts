import { test, expect } from '@playwright/test';
import { injectRippleEffect } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Technician Attendance Logging', async ({ page }) => {
  await injectRippleEffect(page);

  // 1. Login Flow (Technician)
  await demoLogin(page, 'TECHNICIAN');

  // 2. Navigate to Operations -> Attendance
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const attendanceLink = page
    .getByRole('link', { name: /attendance|absensi/i })
    .first();
  try {
    if (await attendanceLink.isVisible({ timeout: 2000 })) {
      await attendanceLink.click();
    } else {
      await page.goto('/attendance');
    }
  } catch {
    await page.goto('/attendance');
  }

  await expect(page).toHaveURL(/\/attendance/);
  await page.waitForTimeout(DELAY);

  // 3. Simulate clocking in (Visual only, don't submit to keep DB clean if possible)
  const clockInBtn = page.getByRole('button', { name: /clock in|masuk/i });
  if (await clockInBtn.isVisible()) {
    await clockInBtn.click();
    await page.waitForTimeout(1000);

    // Simulate photo capture/upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // In a real test we'd upload a dummy image here
      // await fileInput.setInputFiles('dummy.jpg');
    }

    const cancelBtn = page.getByRole('button', { name: /cancel|batal/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
  }

  await page.waitForTimeout(DELAY);
});
