import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  saveLogSheet,
  submitLogSheet,
  completeLogSheet,
  signAsTechnician,
  addSignature,
  fillRawWaterEntry,
} from '../fixtures/log-sheet-fixture';

test.describe('Admin Override Flow', () => {
  test('admin can unlock and edit submitted log sheet', async ({ page }) => {
    test.setTimeout(90000);

    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      chillers: ['1'],
      coolingTowers: ['2'],
    });

    // Sign both signatures (each triggers a data reload)
    await signAsTechnician(page);
    await expect(
      page.locator('fieldset').getByRole('spinbutton').first()
    ).toBeVisible({ timeout: 15000 });
    await addSignature(page, 'CLIENT_PIC');
    // Wait for reload to finish after signature saves
    await expect(
      page.locator('fieldset').getByRole('spinbutton').first()
    ).toBeVisible({ timeout: 15000 });

    // Fill all table-based fields (machine params, raw water, etc.)
    await completeLogSheet(page);
    await fillRawWaterEntry(page, 'pH', 7.2);
    await fillRawWaterEntry(page, 'TDS', 100);
    await fillRawWaterEntry(page, 'Conductivity', 1200);

    // Fill Water Meter consumption fields (outside tables, in "Sebelum"/"Sesudah" section)
    const sebelumInput = page
      .getByText('Sebelum')
      .locator('..')
      .getByRole('spinbutton');
    const sesudahInput = page
      .getByText('Sesudah')
      .locator('..')
      .getByRole('spinbutton');
    await expect(sebelumInput).toBeVisible({ timeout: 10000 });
    await sebelumInput.fill('100');
    await sesudahInput.fill('120');
    // Wait for auto-calculated Total to propagate to entry state
    await page.waitForTimeout(1000);

    await submitLogSheet(page);

    // Refresh to ensure we get the locked state from server
    await page.reload();
    await expect(page.getByRole('spinbutton').first()).toBeVisible({
      timeout: 15000,
    });

    const firstInput = page.getByRole('spinbutton').first();
    await expect(firstInput).toBeDisabled();

    // "Buka Kunci" may be inside the "Tindakan" dropdown menu
    let unlockButton = page.getByRole('button', { name: /buka kunci/i });
    if (!(await unlockButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      const tindakanBtn = page.getByRole('button', { name: /tindakan/i });
      if (await tindakanBtn.isVisible()) {
        await tindakanBtn.click();
        unlockButton = page
          .getByRole('menuitem', { name: /buka kunci/i })
          .or(page.getByRole('button', { name: /buka kunci/i }))
          .first();
      }
    }
    await expect(unlockButton).toBeVisible({ timeout: 10000 });
    await unlockButton.click();

    await expect(firstInput).toBeEnabled();

    // Edit a value
    await firstInput.fill('9.9');
    await saveLogSheet(page);

    // "Kunci Kembali" may be inside the "Tindakan" dropdown menu
    let lockButton = page.getByRole('button', { name: /kunci kembali/i });
    if (!(await lockButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      const tindakanBtn = page.getByRole('button', { name: /tindakan/i });
      if (await tindakanBtn.isVisible()) {
        await tindakanBtn.click();
        lockButton = page
          .getByRole('menuitem', { name: /kunci kembali/i })
          .or(page.getByRole('button', { name: /kunci kembali/i }))
          .first();
      }
    }
    if (await lockButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await lockButton.click();
    }
  });

  test('admin can view all log sheets across projects', async ({ page }) => {
    await page.goto('/log-sheets');

    // Wait for the table to be visible and contain data
    const projectTable = page.getByRole('table');
    await expect(projectTable).toBeVisible({ timeout: 15000 });

    const projectRows = page
      .getByRole('row')
      .filter({ has: page.getByRole('link', { name: /buka/i }) });
    const count = await projectRows.count();

    expect(count).toBeGreaterThan(0);

    const openButton = projectRows.first().getByRole('link', { name: /buka/i });

    await openButton.click();
    await expect(page.getByRole('heading', { name: /log sheet/i })).toBeVisible(
      { timeout: 15000 }
    );
  });
});
