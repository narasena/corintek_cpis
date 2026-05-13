import { test, expect } from '@playwright/test';

async function demoLogin(
  page: any,
  role: 'ADMIN' | 'TECHNICIAN' | 'SUPERVISOR' | 'CLIENT_SUPERVISOR'
) {
  await page.goto('/login');

  const emailMap: Record<string, string> = {
    ADMIN: process.env.E2E_ADMIN_EMAIL ?? 'admin@corintek.test',
    TECHNICIAN: process.env.E2E_TECHNICIAN_EMAIL ?? 'technician@corintek.test',
    SUPERVISOR: process.env.E2E_SUPERVISOR_EMAIL ?? 'supervisor@corintek.test',
    CLIENT_SUPERVISOR:
      process.env.E2E_CLIENT_PIC_EMAIL ?? 'client-pic@client.test',
  };
  const password = process.env.E2E_ADMIN_PASSWORD ?? 'password';

  await page.getByRole('textbox', { name: /email/i }).fill(emailMap[role]);
  await page.getByRole('textbox', { name: /password/i }).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/(dashboard|my-projects|log-sheets|$)/, {
    timeout: 10000,
  });
}

test.describe('Attendance Access Control', () => {
  test.describe('Technician access', () => {
    test('can access /attendance and see clock in/out', async ({ page }) => {
      await demoLogin(page, 'TECHNICIAN');
      await page.goto('/attendance');

      await expect(page).toHaveURL(/\/attendance$/);
      await expect(
        page.getByRole('button', { name: /absen masuk/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /absen pulang/i })
      ).toBeVisible();

      // History table below
      await expect(page.getByText(/riwayat absensi/i)).toBeVisible();
    });
  });

  test.describe('Supervisor access', () => {
    test('can access /attendance and see read-only table', async ({ page }) => {
      await demoLogin(page, 'SUPERVISOR');
      await page.goto('/attendance');

      await expect(page).toHaveURL(/\/attendance$/);
      // No clock in/out buttons
      await expect(
        page.getByRole('button', { name: /absen masuk/i })
      ).not.toBeVisible();
      await expect(
        page.getByRole('button', { name: /absen pulang/i })
      ).not.toBeVisible();

      // Table header
      await expect(page.getByText(/teknis/i)).toBeVisible();
    });
  });

  test.describe('Admin access', () => {
    test('redirects from /attendance to /attendance/admin', async ({
      page,
    }) => {
      await demoLogin(page, 'ADMIN');
      await page.goto('/attendance');

      await expect(page).toHaveURL(/\/attendance\/admin$/);
    });

    test('admin page shows filters and table', async ({ page }) => {
      await demoLogin(page, 'ADMIN');
      await page.goto('/attendance/admin');

      await expect(page).toHaveURL(/\/attendance\/admin$/);
      await expect(page.getByLabel(/tanggal/i)).toBeVisible();
      await expect(
        page.getByRole('button', { name: /export csv/i })
      ).toBeVisible();

      // Project dropdown present
      await expect(
        page.getByRole('combobox', { name: /semua proyek/i })
      ).toBeVisible();
    });
  });

  test.describe('Client Supervisor access', () => {
    test('redirected to home with error toast', async ({ page }) => {
      await demoLogin(page, 'CLIENT_SUPERVISOR');
      await page.goto('/attendance');

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByText(/akses ditolak/i)).toBeVisible();
    });
  });
});
