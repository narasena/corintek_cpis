import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillRawWaterEntry,
  saveLogSheet,
  submitLogSheet,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Validation Recovery', () => {
  test('submit without signatures shows validation error', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    await submitLogSheet(page);

    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    await expect(
      page.getByText(/tanda tangan.*belum.*diisi|signature.*required/i)
    ).toBeVisible();
  });

  test('out-of-range value shows visual warning', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 15, '1');

    const errorInput = page.getByRole('textbox', { name: /15/ });
    await expect(errorInput).toHaveClass(/border-red-500|bg-red-50/, {
      timeout: 3000,
    });

    await fillNumericEntry(page, 'pH', 7.5, '1');

    await expect(errorInput).not.toHaveClass(/border-red-500|bg-red-50/);
  });

  test('missing required entries prevents submission', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const submitButton = page.getByRole('button', { name: /kirim$/i });
    await submitButton.click();

    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible();

    const confirmButton = confirmDialog.getByRole('button', { name: /kirim/i });
    await confirmButton.click();

    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('validation error can be fixed and submission retried', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    const submitButton = page.getByRole('button', { name: /kirim$/i });
    await submitButton.click();

    const confirmDialog = page.getByRole('alertdialog');
    await confirmDialog.getByRole('button', { name: /kirim/i }).click();

    await expect(
      page.getByText(/tanda tangan.*belum|signature.*required/i)
    ).toBeVisible();

    const technicianSection = page.locator('div', {
      has: page.getByText(/teknisi/i),
    });

    const signButton = technicianSection.getByRole('button', {
      name: /tanda tangan/i,
    });
    if (await signButton.isVisible()) {
      await signButton.click();

      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        await canvas.click({ position: { x: 50, y: 50 } });

        const saveSignButton = page
          .getByRole('dialog')
          .getByRole('button', { name: /simpan/i });
        await saveSignButton.click();
      }
    }

    await saveLogSheet(page);

    await submitLogSheet(page);
  });

  test('raw water validation accepts values within range', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillRawWaterEntry(page, 'pH', 7.0);

    const rawWaterInput = page.getByRole('textbox').filter({
      has: page.getByRole('cell', { name: /raw water/i }),
    });

    await expect(rawWaterInput.first()).not.toHaveClass(/border-red-500/);
  });
});
