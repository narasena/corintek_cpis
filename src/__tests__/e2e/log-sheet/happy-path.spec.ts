import { test, expect } from '@playwright/test';
import {
  createLogSheet,
  selectActiveMachines,
  fillNumericEntry,
  fillRawWaterEntry,
  saveLogSheet,
  submitLogSheet,
} from '../fixtures/log-sheet-fixture';

test.describe('Log Sheet Happy Path', () => {
  test('technician fills entries, signs, and submits log sheet successfully', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    expect(logSheet.id).toBeTruthy();
    expect(logSheet.projectId).toBe(projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    const paramTable = page.getByRole('table');
    await expect(paramTable).toBeVisible();

    await fillNumericEntry(page, 'pH', 7.2, '1');
    await fillNumericEntry(page, 'Conductivity', 1200, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    const technicianSection = page.locator('div', {
      hasText: /tanda tangan/i,
    });
    await expect(technicianSection).toBeVisible();

    const clientSection = page.locator('div', {
      hasText: /pic klien/i,
    });
    await expect(clientSection).toBeVisible();

    await saveLogSheet(page);

    await expect(page.getByText(/DRAFT/)).toBeVisible();

    await submitLogSheet(page);

    await expect(page.getByText(/SUBMITTED/)).toBeVisible({
      timeout: 10000,
    });
  });

  test('technician can save draft and continue later', async ({ page }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';

    const logSheet = await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 7.5, '1');

    await saveLogSheet(page);

    await page.goto('/log-sheets');

    await page.goto(`/log-sheets/${logSheet.projectId}/${logSheet.id}`);

    const phInput = page.getByRole('textbox', { name: /7\.5/ });
    await expect(phInput).toBeVisible();
  });
});
