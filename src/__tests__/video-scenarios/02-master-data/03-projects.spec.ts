import { test, expect } from '@playwright/test';
import { injectRippleEffect, typeLikeHuman } from '../helpers/visual';
import { demoLogin } from '../helpers/auth';

test.describe.configure({ mode: 'serial' });

const DELAY = 2000;

test('System Demo: Project Assignment', async ({ page }) => {
  await injectRippleEffect(page);
  await demoLogin(page, 'ADMIN');

  // Navigate to Master Data -> Projects
  const menuBtn = page.getByRole('button', { name: /menu|hamburger/i });
  try {
    if (await menuBtn.isVisible({ timeout: 2000 })) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch {}

  const projectsLink = page
    .getByRole('link', { name: /project|proyek/i })
    .first();
  try {
    if (await projectsLink.isVisible({ timeout: 2000 })) {
      await projectsLink.click();
    } else {
      await page.goto('/projects');
    }
  } catch {
    await page.goto('/projects');
  }

  await expect(page).toHaveURL(/\/projects/);
  await page.waitForTimeout(DELAY);

  // 3. Create a new Project
  const addBtn = page.getByRole('button', { name: /add|tambah/i });
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await page.waitForTimeout(1000);
  }

  // FSD Form Data Project
  const nameInput = page.getByRole('textbox', { name: /nama|name/i });
  if (await nameInput.isVisible()) {
    await typeLikeHuman(
      page,
      'input[name="project_name"]',
      'Demo: Annual Maintenance 2026'
    );
    await page.waitForTimeout(500);

    await typeLikeHuman(page, 'input[name="quotation_no"]', 'QT-2026-001');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /cancel|batal/i }).click();
  }

  await page.waitForTimeout(DELAY);
});
