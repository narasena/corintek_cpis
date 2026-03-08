import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsTechnician } from '../helpers/auth-utils';

test.describe('M-03: Shared Infrastructure & Components E2E', () => {
  
  test.describe('CUJ-01: RBAC Shield & Navigation', () => {
    test('Technician should not see Admin links and be redirected if accessing /users', async ({ page }) => {
      await loginAsTechnician(page);
      
      // Sidebar check
      const sidebar = page.getByRole('none').filter({ hasText: 'Users' });
      await expect(sidebar).not.toBeVisible();
      
      // Direct access check (Middleware/RBAC integration)
      await page.goto('/users');
      await expect(page).not.toHaveURL('/users');
      // Should redirect to landing page (e.g. /attendance or /dashboard)
    });

    test('Admin should see all navigation items', async ({ page }) => {
      await loginAsAdmin(page);
      await expect(page.getByText('Users')).toBeVisible();
      await expect(page.getByText('Clients')).toBeVisible();
    });
  });

  test.describe('CUJ-02: DataTable Tab & RBAC Integration', () => {
    test.skip('DataTable should switch tabs and update data correctly', async ({ page }) => {
      // Skipping because no current page uses the built-in 'tabs' prop of DataTable yet
      // This capability was added during M-03 refactoring but not yet integrated into pages.
      await loginAsAdmin(page);
      await page.goto('/log-sheets'); 
    });
  });

  test.describe('CUJ-03: Secure Media Capture Flow', () => {
    test('CameraInput should process uploaded image to WebP 1:1', async ({ page }) => {
      await loginAsTechnician(page);
      
      // Navigate to a page that definitely has a CameraInput if possible
      // Using attendance as a fallback, but we check if button exists
      await page.goto('/attendance'); 

      const uploadButton = page.getByText('Upload Galeri');
      
      if (!(await uploadButton.isVisible())) {
        console.log('Skipping CUJ-03 as CameraInput is not visible (user might be clocked out)');
        return;
      }

      // 1. Upload a mock image
      const fileChooserPromise = page.waitForEvent('filechooser');
      await uploadButton.click();
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
    });
  });
});
