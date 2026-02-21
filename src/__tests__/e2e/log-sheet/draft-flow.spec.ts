import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  saveLogSheet,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Draft Flow', () => {
  test('technician saves incomplete draft and resumes later', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      chillers: ['1'],
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');

    await saveLogSheet(page);

    await page.goto('/log-sheets');

    await page.goto(`/log-sheets/${logSheet.projectId}`);

    const createdRow = page.getByRole('row').filter({
      hasText: logSheet.id.substring(0, 8),
    });
    await expect(createdRow).toBeVisible();

    await createdRow.click();

    await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

    const phCell = page.getByRole('cell', { name: 'pH' }).first();
    await expect(phCell).toBeVisible();
  });

  test('technician selects and deselects machines dynamically', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1', '2'],
    });

    const ct1Column = page.getByRole('columnheader', { name: /ct #1/i });
    const ct2Column = page.getByRole('columnheader', { name: /ct #2/i });

    await expect(ct1Column).toBeVisible();
    await expect(ct2Column).toBeVisible();

    const clearCT2Button = page
      .getByRole('button', { name: /kosongkan/i })
      .nth(1);
    await clearCT2Button.click();

    await expect(ct2Column).not.toBeVisible();

    const selectAllButton = page
      .getByRole('button', { name: /pilih semua/i })
      .nth(1);
    await selectAllButton.click();

    await expect(ct2Column).toBeVisible();
  });

  test('technician adds notes to log sheet', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const notesSection = page.getByRole('textbox', { name: /catatan/i });
    await notesSection.fill('Test note for E2E testing');

    await saveLogSheet(page);

    await page.reload();

    await expect(notesSection).toHaveValue('Test note for E2E testing');
  });

  test('technician enters chemical usage', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const chemicalSection = page.getByText(/chemical|penggunaan/i).first();
    await expect(chemicalSection).toBeVisible();

    const addChemicalButton = page.getByRole('button', {
      name: /tambah chemical|add chemical/i,
    });
    if (await addChemicalButton.isVisible()) {
      await addChemicalButton.click();

      const chemicalSelect = page.getByRole('combobox', { name: /chemical/i });
      await chemicalSelect.click();
      await page.getByRole('option').first().click();

      const amountInput = page.getByRole('spinbutton', {
        name: /jumlah|amount/i,
      });
      await amountInput.fill('100');
    }
  });
});
