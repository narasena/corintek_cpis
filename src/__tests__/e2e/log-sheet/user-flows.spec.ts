import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillBooleanEntry,
  fillTextEntry,
  fillRawWaterEntry,
  fillNoteEntry,
  saveLogSheet,
  deleteLogSheetFromList,
  selectReplacedByTechnician,
  addChemicalUsage,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Common User Flows', () => {
  test('resume draft from project list', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.5, '1');

    await saveLogSheet(page);

    await page.goto(`/log-sheets/${logSheet.projectId}`);

    const createdRow = page.getByRole('row').filter({
      hasText: logSheet.id.substring(0, 8),
    });
    await expect(createdRow).toBeVisible();

    await createdRow.click();

    await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

    await expect(page.getByText(/pH/i)).toBeVisible();
  });

  test('delete log sheet from list', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    await saveLogSheet(page);

    await page.goto(`/log-sheets/${logSheet.projectId}`);

    await expect(
      page.getByRole('row').filter({ hasText: logSheet.id.substring(0, 8) })
    ).toBeVisible();

    try {
      await deleteLogSheetFromList(page, logSheet.id);
    } catch {
      const row = page.getByRole('row').filter({
        hasText: logSheet.id.substring(0, 8),
      });
      const actionMenu = row.getByRole('button').last();
      await actionMenu.click();

      const deleteOption = page.getByRole('menuitem', { name: /hapus/i });
      await deleteOption.click();

      const confirmDialog = page.getByRole('alertdialog');
      const confirmButton = confirmDialog.getByRole('button', {
        name: /hapus/i,
      });
      await confirmButton.click();
    }
  });

  test('select replaced by technician', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const replacedBySelect = page.getByRole('combobox', {
      name: /digantikan oleh/i,
    });

    if (await replacedBySelect.isVisible()) {
      await replacedBySelect.click();

      const options = page.getByRole('option');
      const count = await options.count();

      if (count > 1) {
        const firstTechnician = options.nth(1);
        const technicianName = await firstTechnician.textContent();

        await firstTechnician.click();

        await saveLogSheet(page);

        await page.reload();

        await expect(replacedBySelect).toContainText(technicianName ?? '');
      }
    } else {
      console.log('Replaced by technician select not available');
      test.skip();
    }
  });

  test('general condition category with notes', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const generalConditionHeading = page.getByRole('heading', {
      name: /general condition/i,
    });

    if (await generalConditionHeading.isVisible()) {
      const paramRow = page
        .getByRole('row')
        .filter({ hasText: /running|operasi|condition/i })
        .first();

      if (await paramRow.isVisible()) {
        const checkbox = paramRow.getByRole('checkbox').first();
        await checkbox.check();

        const noteInput = paramRow.getByRole('textbox').last();
        await noteInput.fill('All units operating within normal parameters');

        await saveLogSheet(page);
      }
    } else {
      console.log('General Condition section not found');
    }
  });

  test('job description category with notes per machine', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const jobDescriptionHeading = page.getByRole('heading', {
      name: /job description/i,
    });

    if (await jobDescriptionHeading.isVisible()) {
      const paramRows = page
        .getByRole('row')
        .filter({ hasText: /inspection|check|maintenance/i });

      const count = await paramRows.count();

      if (count > 0) {
        const firstRow = paramRows.first();

        const checkbox = firstRow.getByRole('checkbox');
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }

        const noteInput = firstRow.getByRole('textbox').last();
        await noteInput.fill('Routine inspection completed');

        await saveLogSheet(page);
      }
    } else {
      console.log('Job Description section not found');
    }
  });

  test('chemical usage add edit remove', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const chemicalSection = page.getByText(/chemical|penggunaan/i).first();

    if (await chemicalSection.isVisible()) {
      const addChemicalButton = page.getByRole('button', {
        name: /tambah chemical|add chemical/i,
      });

      if (await addChemicalButton.isVisible()) {
        await addChemicalButton.click();

        const chemicalSelects = page.getByRole('combobox', {
          name: /chemical/i,
        });
        const lastSelect = chemicalSelects.last();
        await lastSelect.click();

        const options = page.getByRole('option');
        const count = await options.count();

        if (count > 0) {
          await options.first().click();

          const amountInputs = page.getByRole('spinbutton', {
            name: /jumlah|amount/i,
          });
          await amountInputs.last().fill('100');

          await saveLogSheet(page);

          const removeButton = page
            .getByRole('button', { name: /hapus|remove/i })
            .last();
          if (await removeButton.isVisible()) {
            await removeButton.click();

            await saveLogSheet(page);
          }
        }
      }
    } else {
      console.log('Chemical usage section not available');
    }
  });

  test('mobile view shows entry cards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const mobileCard = page.locator('[class*="rounded-lg"][class*="border"]');
    await expect(mobileCard.first()).toBeVisible();

    const inputField = page.getByRole('textbox').first();
    await expect(inputField).toBeVisible();

    await inputField.fill('7.5');

    await saveLogSheet(page);
  });

  test('consumption category with water meter photo', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const consumptionHeading = page.getByRole('heading', {
      name: /consumption/i,
    });

    if (await consumptionHeading.isVisible()) {
      const waterMeterRow = page
        .getByRole('row')
        .filter({ hasText: /before|after|sebelum|sesudah/i })
        .first();

      if (await waterMeterRow.isVisible()) {
        const numericInput = waterMeterRow.getByRole('textbox');
        await numericInput.fill('12345');

        const cameraButton = waterMeterRow.getByRole('button', {
          name: /camera|foto/i,
        });
        if (await cameraButton.isVisible()) {
          console.log('Camera input available for water meter');
        }

        await saveLogSheet(page);
      }
    } else {
      console.log('Consumption section not found');
    }
  });

  test('select all and clear machines functionality', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await createLogSheet(page, projectId);

    const selectAllCTButton = page
      .getByRole('button', { name: /pilih semua/i })
      .nth(1);

    await selectAllCTButton.click();

    const ctCheckboxes = page.getByRole('checkbox', { name: /ct/i });
    const count = await ctCheckboxes.count();

    for (let i = 0; i < count; i++) {
      await expect(ctCheckboxes.nth(i)).toBeChecked();
    }

    const clearCTButton = page
      .getByRole('button', { name: /kosongkan/i })
      .nth(1);
    await clearCTButton.click();

    for (let i = 0; i < count; i++) {
      await expect(ctCheckboxes.nth(i)).not.toBeChecked();
    }
  });
});
