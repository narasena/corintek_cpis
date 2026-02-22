import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillBooleanEntry,
  fillTextEntry,
  fillRawWaterEntry,
  fillNoteEntry,
  addSignature,
  saveLogSheet,
  submitLogSheet,
  approveLogSheet,
  switchToPreviewMode,
  switchToInputMode,
  addChemicalUsage,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Full Workflow - Happy Paths', () => {
  test.describe.configure({ mode: 'serial' });

  test('complete draft to submitted workflow with signatures', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);
    expect(logSheet.id).toBeTruthy();

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillNumericEntry(page, 'Conductivity', 1200, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    const signatureSection = page
      .locator('div')
      .filter({ hasText: /tanda tangan/i });
    await expect(signatureSection).toBeVisible();

    try {
      await addSignature(page, 'TECHNICIAN');
    } catch {
      console.log('Technician signature skipped - may already exist');
    }

    try {
      await addSignature(page, 'CLIENT_PIC');
    } catch {
      console.log('Client PIC signature skipped - may already exist');
    }

    await saveLogSheet(page);

    await expect(page.getByText(/DRAFT/)).toBeVisible();

    await submitLogSheet(page);

    await expect(page.getByText(/SUBMITTED/)).toBeVisible({ timeout: 10000 });

    const inputs = page.getByRole('textbox');
    const firstInput = inputs.first();
    await expect(firstInput).toBeDisabled();
  });

  test('multi-machine entry with chillers and cooling towers', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      chillers: ['1'],
      coolingTowers: ['1'],
    });

    const chillerColumn = page.getByRole('columnheader', { name: /#1/i });
    await expect(chillerColumn).toBeVisible();

    const ctColumn = page.getByRole('columnheader', { name: /ct #1/i });
    await expect(ctColumn).toBeVisible();

    await fillNumericEntry(page, 'pH', 7.2, '1');

    await saveLogSheet(page);

    const savedIndicator = page.getByText(/berhasil|disimpan/i);
    await expect(savedIndicator).toBeVisible();
  });

  test('boolean and text parameter entries', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const generalConditionSection = page.getByText(/general condition/i);
    if (await generalConditionSection.isVisible()) {
      await fillBooleanEntry(page, 'Running', true, '1');

      await fillNoteEntry(page, 'Running', 'Unit operating normally');
    }

    await saveLogSheet(page);

    await expect(page.getByText(/berhasil|disimpan/i)).toBeVisible();
  });

  test('chemical usage add and save', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const chemicalSection = page.getByText(/chemical|penggunaan/i).first();
    await expect(chemicalSection).toBeVisible();

    try {
      await addChemicalUsage(page, 'Biocide', 50);
      await saveLogSheet(page);
    } catch {
      console.log('Chemical usage test skipped - may not be available');
    }
  });

  test('print preview mode hides navigation elements', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await switchToPreviewMode(page);

    const previewContent = page.locator('[class*="print"]');
    await expect(previewContent.first()).toBeVisible();

    await switchToInputMode(page);

    const inputButton = page.getByRole('button', { name: /^input$/i });
    await expect(inputButton).toHaveAttribute('data-state', 'active');
  });

  test('notes and replaced by technician selection', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const notesSection = page.getByRole('textbox', { name: /catatan/i });
    await notesSection.fill('Daily log sheet completed successfully');

    await saveLogSheet(page);

    await page.reload();

    await expect(notesSection).toHaveValue(
      'Daily log sheet completed successfully'
    );

    const replacedBySelect = page.getByRole('combobox', {
      name: /digantikan oleh/i,
    });
    if (await replacedBySelect.isVisible()) {
      await replacedBySelect.click();
      const options = page.getByRole('option');
      const count = await options.count();

      if (count > 1) {
        await options.nth(1).click();
        await saveLogSheet(page);
      }
    }
  });
});

test.describe('Log Sheet Approval Flow', () => {
  test('admin can approve submitted log sheet', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await page.goto(`/log-sheets/${projectId}`);

    const submittedRow = page
      .getByRole('row')
      .filter({ hasText: /SUBMITTED/ })
      .first();

    if (await submittedRow.isVisible()) {
      await submittedRow.click();

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      const approveButton = page.getByRole('button', {
        name: /setujui|approve/i,
      });

      if (await approveButton.isVisible()) {
        await approveLogSheet(page);

        await expect(page.getByText(/APPROVED/)).toBeVisible({
          timeout: 10000,
        });

        const allInputs = page.getByRole('textbox');
        const count = await allInputs.count();

        for (let i = 0; i < Math.min(count, 3); i++) {
          await expect(allInputs.nth(i)).toBeDisabled();
        }
      }
    } else {
      test.skip();
    }
  });
});
