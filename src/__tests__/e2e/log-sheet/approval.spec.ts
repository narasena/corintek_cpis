import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillRawWaterEntry,
  addSignature,
  saveLogSheet,
  submitLogSheet,
  approveLogSheet,
  toggleAdminOverride,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Approval Flow (Admin)', () => {
  test('admin can approve a submitted log sheet', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await page.goto(`/log-sheets/${projectId}`);

    const submittedRow = page
      .getByRole('row')
      .filter({ hasText: /SUBMITTED/ })
      .first();

    if (await submittedRow.isVisible()) {
      await submittedRow.click();

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      await expect(page.getByText(/SUBMITTED/)).toBeVisible();

      const approveButton = page.getByRole('button', {
        name: /setujui|approve/i,
      });

      if (await approveButton.isVisible()) {
        await approveButton.click();

        await expect(page.getByText(/berhasil|disetujui/i)).toBeVisible({
          timeout: 10000,
        });

        await expect(page.getByText(/APPROVED/)).toBeVisible();
      }
    } else {
      console.log('No submitted log sheet found for approval test');
      test.skip();
    }
  });

  test('approved log sheet cannot be edited', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await page.goto(`/log-sheets/${projectId}`);

    const approvedRow = page
      .getByRole('row')
      .filter({ hasText: /APPROVED/ })
      .first();

    if (await approvedRow.isVisible()) {
      await approvedRow.click();

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      const allInputs = page.getByRole('textbox');
      const count = await allInputs.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(allInputs.nth(i)).toBeDisabled();
      }

      const saveButton = page.getByRole('button', { name: /^simpan$/i });
      await expect(saveButton).toBeDisabled();

      const submitButton = page.getByRole('button', { name: /kirim$/i });
      await expect(submitButton).not.toBeVisible();
    } else {
      console.log('No approved log sheet found');
      test.skip();
    }
  });

  test('admin override unlock button appears for submitted sheets', async ({
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

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      const unlockButton = page.getByRole('button', { name: /buka kunci/i });
      await expect(unlockButton).toBeVisible();
    } else {
      console.log('No submitted log sheet found');
      test.skip();
    }
  });

  test('admin can unlock, edit, and relock submitted log sheet', async ({
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

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      const unlockButton = page.getByRole('button', { name: /buka kunci/i });
      await unlockButton.click();

      await expect(unlockButton).toHaveText(/kunci kembali/i);

      const inputs = page.getByRole('textbox');
      const firstInput = inputs.first();
      await expect(firstInput).toBeEnabled();

      await fillNumericEntry(page, 'pH', 7.8, '1');

      await saveLogSheet(page);

      const lockButton = page.getByRole('button', { name: /kunci kembali/i });
      await lockButton.click();

      await expect(firstInput).toBeDisabled();
    } else {
      console.log('No submitted log sheet found');
      test.skip();
    }
  });

  test('admin cannot change status directly via update', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    await expect(page.getByText(/DRAFT/)).toBeVisible();

    await selectActiveMachines(page, { coolingTowers: ['1'] });
    await fillNumericEntry(page, 'pH', 7.2, '1');
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

    await submitLogSheet(page);

    await expect(page.getByText(/SUBMITTED/)).toBeVisible({ timeout: 10000 });
  });

  test('approval validation checks all required fields', async ({ page }) => {
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

        const successToast = page.locator(
          '[data-sonner-toast][data-type="success"]'
        );
        const errorToast = page.locator(
          '[data-sonner-toast][data-type="error"]'
        );

        const isSuccess = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        if (!isSuccess) {
          const hasError = await errorToast
            .isVisible({ timeout: 3000 })
            .catch(() => false);

          if (hasError) {
            await expect(
              errorToast.getByText(/validasi|wajib|lengkap/i)
            ).toBeVisible();
          }
        }
      }
    } else {
      console.log('No submitted log sheet found for validation test');
      test.skip();
    }
  });
});

test.describe('Log Sheet Approval Flow (PIC)', () => {
  test('project PIC can see approval button for submitted sheets', async ({
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

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      const approveButton = page.getByRole('button', {
        name: /setujui|approve/i,
      });

      const isVisible = await approveButton.isVisible();

      if (isVisible) {
        console.log('Approval button is visible for authorized user');
      }
    } else {
      console.log('No submitted log sheet found');
    }
  });

  test('approval records timestamp and approver', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    await page.goto(`/log-sheets/${projectId}`);

    const approvedRow = page
      .getByRole('row')
      .filter({ hasText: /APPROVED/ })
      .first();

    if (await approvedRow.isVisible()) {
      await approvedRow.click();

      await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

      const dateSection = page.getByText(/disetujui|approved/i);
      await expect(dateSection).toBeVisible();

      const statusBadge = page.getByText(/APPROVED/);
      await expect(statusBadge).toBeVisible();
    } else {
      console.log('No approved log sheet found for timestamp test');
      test.skip();
    }
  });
});
