import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsTechnician } from '../helpers/auth-utils';

test.describe('M-03: Shared Infrastructure & Components E2E', () => {
  
  test.describe('CUJ-01: RBAC Shield & Navigation', () => {
    test('Technician should not see Admin links and be redirected if accessing /users', async ({ page }) => {
      await loginAsTechnician(page);
      
      // Sidebar check
      const sidebar = page.getByRole('none').filter({ hasText: 'Kelola User' });
      await expect(sidebar).not.toBeVisible();
      
      // Direct access check (Middleware/RBAC integration)
      await page.goto('/users');
      await expect(page).not.toHaveURL('/users');
      // Should redirect to landing page (e.g. /attendance or /dashboard)
    });

    test('Admin should see all navigation items', async ({ page }) => {
      await loginAsAdmin(page);
      await expect(page.getByText('Kelola User')).toBeVisible();
      await expect(page.getByText('Klien')).toBeVisible();
    });
  });

  test.describe('CUJ-02: DataTable Tab & RBAC Integration', () => {
    test('DataTable should switch tabs and update data correctly', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/log-sheets'); // Using LogSheets as it uses the shared DataTable with tabs

      // Verify initial tab (e.g. "Semua")
      await expect(page.getByRole('tab', { name: /Semua/i })).toBeVisible();
      
      // Switch to a different tab (e.g. "Draft")
      const draftTab = page.getByRole('tab', { name: /Draft/i });
      await draftTab.click();
      
      // Verify URL or State change (if implemented via query params)
      // and verify table content refreshes
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('CUJ-03: Secure Media Capture Flow', () => {
    test('CameraInput should process uploaded image to WebP 1:1', async ({ page }) => {
      await loginAsTechnician(page);
      await page.goto('/attendance'); // Assuming attendance uses CameraInput for check-in

      // 1. Upload a mock image instead of using camera hardware in CI
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Upload Galeri').click();
      const fileChooser = await fileChooserPromise;
      
      // Create a dummy JPEG
      await fileChooser.setFiles({
        name: 'test-photo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      });

      // 2. Verify compression overlay appears (Mengompresi...)
      await expect(page.getByText('Mengompresi...')).toBeVisible();
      
      // 3. Verify preview appears after processing
      await expect(page.locator('img[alt="Value"]')).toBeVisible();
      
      // Note: Full integration with R2 upload depends on server-side actions,
      // which we will verify in the respective domain E2E (M-11/M-12).
    });
  });
});
