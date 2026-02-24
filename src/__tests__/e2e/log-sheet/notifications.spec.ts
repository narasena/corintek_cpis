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
import { PrismaClient } from '../../../generated/prisma/client';

const prisma = new PrismaClient();

test.describe('Log Sheet Notifications', () => {
  test('submitting log sheet with out-of-range value creates notifications', async ({
    page,
  }) => {
    const projectId = process.env.E2E_PROJECT_ID ?? 'test-project-id';
    const technicianEmail =
      process.env.E2E_TECHNICIAN_EMAIL ?? 'technician@corintek.test';

    const technician = await prisma.user.findUnique({
      where: { email: technicianEmail },
    });

    if (!technician) {
      test.skip();
    }

    const beforeCount = await prisma.notification.count({
      where: { userId: technician.id },
    });

    const logSheet = await createLogSheet(page, projectId);

    await selectActiveMachines(page, {
      coolingTowers: ['1'],
    });

    await fillNumericEntry(page, 'pH', 15, '1');
    await fillRawWaterEntry(page, 'pH', 7.0);

    await addSignature(page, 'TECHNICIAN');
    await addSignature(page, 'CLIENT_PIC');

    await saveLogSheet(page);
    await submitLogSheet(page);

    await expect(page.getByText(/SUBMITTED/)).toBeVisible({
      timeout: 10000,
    });

    await page.waitForTimeout(1000);

    const afterCount = await prisma.notification.count({
      where: { userId: technician.id },
    });

    expect(afterCount).toBeGreaterThan(beforeCount);
  });
});

