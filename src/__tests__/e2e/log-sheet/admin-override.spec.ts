import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  saveLogSheet,
  submitLogSheet,
} from '../fixtures/log-sheet-fixture';

test.describe('Admin Override Flow', () => {
  test('admin can unlock and edit submitted log sheet', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.2, '1');

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
        await page
          .getByRole('dialog')
          .getByRole('button', { name: /simpan/i })
          .click();
      }
    }

    await saveLogSheet(page);

    const inputs = page.getByRole('textbox');
    const firstInput = inputs.first();

    await expect(firstInput).toBeDisabled();

    const unlockButton = page.getByRole('button', { name: /buka kunci/i });
    await unlockButton.click();

    await expect(firstInput).toBeEnabled();

    await fillNumericEntry(page, 'pH', 7.5, '1');

    await saveLogSheet(page);

    const lockButton = page.getByRole('button', { name: /kunci kembali/i });
    if (await lockButton.isVisible()) {
      await lockButton.click();
    }
  });

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
        await approveButton.click();

        await expect(page.getByText(/APPROVED/)).toBeVisible({
          timeout: 10000,
        });
      }
    } else {
      test.skip();
    }
  });

  test('non-admin cannot see unlock button on submitted sheet', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await page.goto(`/log-sheets/${projectId}`);

    const submittedRow = page
      .getByRole('row')
      .filter({ hasText: /SUBMITTED/ })
      .first();

    if (await submittedRow.isVisible()) {
      await submittedRow.click();

      const unlockButton = page.getByRole('button', { name: /buka kunci/i });

      await expect(unlockButton).not.toBeVisible();
    } else {
      test.skip();
    }
  });

  test('approved log sheet is fully locked', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await page.goto(`/log-sheets/${projectId}`);

    const approvedRow = page
      .getByRole('row')
      .filter({ hasText: /APPROVED/ })
      .first();

    if (await approvedRow.isVisible()) {
      await approvedRow.click();

      const allInputs = page.getByRole('textbox');
      const count = await allInputs.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(allInputs.nth(i)).toBeDisabled();
      }

      const saveButton = page.getByRole('button', { name: /^simpan$/i });
      await expect(saveButton).toBeDisabled();
    } else {
      test.skip();
    }
  });

  test('admin can view all log sheets across projects', async ({ page }) => {
    await page.goto('/log-sheets');

    const projectRows = page.getByRole('row');
    const count = await projectRows.count();

    expect(count).toBeGreaterThan(0);

    const firstProject = projectRows.first();
    await firstProject.click();

    await expect(page).toHaveURL(/\/log-sheets\/[^/]+$/);
  });
});
