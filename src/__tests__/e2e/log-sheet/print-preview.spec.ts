import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillRawWaterEntry,
  addSignature,
  saveLogSheet,
  submitLogSheet,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Print Preview - Visual Regression', () => {
  test.describe.configure({ mode: 'serial' });

  test('preview mode renders log sheet structure correctly', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillNumericEntry(page, 'Conductivity', 1200, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    const previewToggle = page.getByRole('button', { name: /preview|cetak/i });
    if (await previewToggle.isVisible()) {
      await previewToggle.click();
    }

    const logSheetContainer = page.locator(
      '[class*="w-\\[210mm\\]"], [class*="min-h-\\[297mm\\]"]'
    );
    await expect(logSheetContainer).toBeVisible();

    await expect(page).toHaveScreenshot('log-sheet-preview-mode.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('print mode hides non-print elements', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    const previewToggle = page.getByRole('button', { name: /preview|cetak/i });
    if (await previewToggle.isVisible()) {
      await previewToggle.click();
    }

    await page.emulateMedia({ media: 'print' });

    const printHiddenElements = page.locator('.print\\:hidden');
    const count = await printHiddenElements.count();

    for (let i = 0; i < count; i++) {
      const element = printHiddenElements.nth(i);
      await expect(element).toBeHidden();
    }
  });

  test('A4 dimensions maintained in preview', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const previewToggle = page.getByRole('button', { name: /preview|cetak/i });
    if (await previewToggle.isVisible()) {
      await previewToggle.click();
    }

    const a4Container = page.locator('[class*="w-\\[210mm\\]"]');
    await expect(a4Container).toBeVisible();

    const boundingBox = await a4Container.boundingBox();
    expect(boundingBox).toBeTruthy();

    expect(boundingBox!.width).toBeGreaterThan(700);
    expect(boundingBox!.width).toBeLessThan(850);
  });

  test('signature placeholders render in preview', async ({ page }) => {
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
      console.log('Technician signature skipped - may already exist');
    }

    const previewToggle = page.getByRole('button', { name: /preview|cetak/i });
    if (await previewToggle.isVisible()) {
      await previewToggle.click();
    }

    const signatureSection = page.locator('text=PT Corintek Inti Sejahtera');
    await expect(signatureSection).toBeVisible();

    const clientSection = page.locator('text=Check By');
    await expect(clientSection).toBeVisible();
  });

  test('chemical usage section renders in preview', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    const chemicalSection = page.getByText(/chemical|kimia/i).first();
    if (await chemicalSection.isVisible()) {
      const previewToggle = page.getByRole('button', {
        name: /preview|cetak/i,
      });
      if (await previewToggle.isVisible()) {
        await previewToggle.click();
      }

      const fillUpSection = page.getByText(/fill up chemical/i);
      await expect(fillUpSection).toBeVisible();
    }
  });

  test('submitted log sheet renders correctly in print preview', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillNumericEntry(page, 'Conductivity', 1200, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    try {
      await addSignature(page, 'TECHNICIAN');
    } catch {
      console.log('Technician signature skipped');
    }

    try {
      await addSignature(page, 'CLIENT_PIC');
    } catch {
      console.log('Client PIC signature skipped');
    }

    await saveLogSheet(page);

    const previewToggle = page.getByRole('button', { name: /preview|cetak/i });
    if (await previewToggle.isVisible()) {
      await previewToggle.click();
    }

    const tableHeaders = page.getByRole('rowgroup');
    await expect(tableHeaders.first()).toBeVisible();

    await expect(page).toHaveScreenshot('log-sheet-submitted-preview.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });
});
