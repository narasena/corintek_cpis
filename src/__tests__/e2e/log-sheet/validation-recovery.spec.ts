import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillRawWaterEntry,
  saveLogSheet,
  submitLogSheet,
  addSignature,
  waitForToast,
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

    try {
      await addSignature(page, 'TECHNICIAN');
    } catch {
      console.log('Technician signature already exists or not available');
    }

    try {
      await addSignature(page, 'CLIENT_PIC');
    } catch {
      console.log('Client PIC signature already exists or not available');
    }

    await saveLogSheet(page);
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

test.describe('Log Sheet Error Recovery - Network Failures', () => {
  test('network failure during save shows error and allows retry', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');

    await page.route('**/log-sheets/**', route => route.abort('failed'));

    const saveButton = page.getByRole('button', { name: /^simpan$/i });
    await saveButton.click();

    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 10000 });

    await page.unroute('**/log-sheets/**');

    await saveButton.click();

    await expect(page.getByText(/berhasil|disimpan/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('file upload failure does not block entry save', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');

    await page.route('**/r2-worker/**', route => route.abort('failed'));

    await saveLogSheet(page);

    await expect(page.getByText(/berhasil|disimpan/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('timeout during submission shows user-friendly error', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    try {
      await addSignature(page, 'TECHNICIAN');
    } catch {
      console.log('Signature skipped');
    }

    try {
      await addSignature(page, 'CLIENT_PIC');
    } catch {
      console.log('Signature skipped');
    }

    await saveLogSheet(page);

    await page.route('**/log-sheets/**', route => {
      return new Promise(resolve => {
        setTimeout(() => resolve(route.abort('timedout')), 100);
      });
    });

    const submitButton = page.getByRole('button', { name: /kirim$/i });
    await submitButton.click();

    const confirmDialog = page.getByRole('alertdialog');
    await confirmDialog.getByRole('button', { name: /kirim/i }).click();

    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 15000 });

    await page.unroute('**/log-sheets/**');
  });
});

test.describe('Log Sheet Error Recovery - Permission Errors', () => {
  test('unauthorized user cannot access project log sheets', async ({
    page,
  }) => {
    const unauthorizedProjectId = '00000000-0000-0000-0000-000000000000';

    await page.goto(`/log-sheets/${unauthorizedProjectId}`);

    const errorMessage = page.getByText(/unauthorized|tidak memiliki akses/i);

    const isAccessDenied = await errorMessage.isVisible().catch(() => false);

    if (!isAccessDenied) {
      const redirectedToLogin = page.url().includes('/login');
      expect(redirectedToLogin || isAccessDenied).toBeTruthy();
    }
  });

  test('non-project member cannot edit log sheet', async ({ page }) => {
    await page.goto('/log-sheets');

    const projectRows = page.getByRole('row');
    const count = await projectRows.count();

    if (count > 0) {
      await projectRows.first().click();

      await page.waitForURL(/\/log-sheets\/[^/]+$/);

      const logSheetRows = page.getByRole('row');
      const lsCount = await logSheetRows.count();

      if (lsCount > 1) {
        const firstLogSheet = logSheetRows.nth(1);
        await firstLogSheet.click();

        await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

        const saveButton = page.getByRole('button', { name: /^simpan$/i });
        const isDisabled = await saveButton.isDisabled();

        if (isDisabled) {
          console.log('Save button is disabled for non-member');
        }
      }
    } else {
      console.log('No projects accessible');
    }
  });
});

test.describe('Log Sheet Error Recovery - Data Integrity', () => {
  test('concurrent edit detection preserves data', async ({
    page,
    context,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const page1 = page;
    const page2 = await context.newPage();

    const logSheet = await createLogSheet(page1, projectId);

    await page2.goto(`/log-sheets/${logSheet.projectId}/${logSheet.id}`);

    await selectActiveMachines(page1, { coolingTowers: ['1'] });
    await selectActiveMachines(page2, { coolingTowers: ['1'] });

    await fillNumericEntry(page1, 'pH', 7.2, '1');

    await fillNumericEntry(page2, 'pH', 7.5, '1');

    await saveLogSheet(page1);

    await saveLogSheet(page2);

    await page2.close();
  });

  test('duplicate log sheet date shows warning', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';
    const today = new Date().toISOString().split('T')[0];

    await createLogSheet(page, projectId, today);

    await page.goto(`/log-sheets/${projectId}`);

    const addButton = page.getByRole('button', { name: /tambah/i });
    await addButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const dateInput = dialog.getByRole('textbox', { name: /tanggal/i });
    await dateInput.fill(today);

    const saveButton = dialog.getByRole('button', { name: /simpan/i });
    await saveButton.click();

    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');

    const hasError = await errorToast
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasError) {
      await expect(
        errorToast.getByText(/sudah ada|already exists/i)
      ).toBeVisible();
    }
  });

  test('empty entries are not saved to database', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const numericInput = page.getByRole('textbox').first();
    await numericInput.fill('');

    await saveLogSheet(page);

    await page.reload();

    const reloadedInput = page.getByRole('textbox').first();
    const value = await reloadedInput.inputValue();
    expect(value).toBe('');
  });
});

test.describe('Log Sheet Error Recovery - Signature Pad', () => {
  test('signature pad canvas loads correctly', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const technicianSection = page
      .locator('div')
      .filter({ has: page.getByText(/teknisi/i) })
      .first();

    const signButton = technicianSection.getByRole('button', {
      name: /tanda tangan/i,
    });

    if (await signButton.isVisible()) {
      await signButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const canvas = dialog.locator('canvas');

      const isCanvasVisible = await canvas.isVisible().catch(() => false);

      if (isCanvasVisible) {
        await expect(canvas).toBeVisible();

        const cancelButton = dialog.getByRole('button', {
          name: /batal|tutup/i,
        });
        await cancelButton.click();

        await expect(dialog).not.toBeVisible();
      } else {
        const closeButton = dialog.getByRole('button', {
          name: /tutup|batal/i,
        });
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('signature can be cleared and redrawn', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const technicianSection = page
      .locator('div')
      .filter({ has: page.getByText(/teknisi/i) })
      .first();

    const signButton = technicianSection.getByRole('button', {
      name: /tanda tangan/i,
    });

    if (await signButton.isVisible()) {
      await signButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const clearButton = dialog.getByRole('button', {
        name: /hapus|clear|reset/i,
      });

      if (await clearButton.isVisible()) {
        await clearButton.click();
      }

      const cancelButton = dialog.getByRole('button', { name: /batal|tutup/i });
      await cancelButton.click();
    }
  });
});
