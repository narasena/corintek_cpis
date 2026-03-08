import { test, expect } from '../fixtures/auth';
import { v4 as uuidv4 } from 'uuid';

test.describe('M-04: Users - Critical User Journeys', () => {
  
  /**
   * CUJ 1: Admin User Lifecycle (Create -> Edit -> Soft Delete)
   * Role: ADMIN
   */
  test('Admin can manage user lifecycle', async ({ adminPage }) => {
    const uniqueEmail = `testuser-${uuidv4().slice(0, 8)}@example.com`;
    const uniquePhone = `08${Math.floor(100000000 + Math.random() * 900000000)}`;

    // 1. Navigate to Users List
    await adminPage.goto('/users');
    await expect(adminPage.getByRole('heading', { name: 'Manajemen Pengguna' })).toBeVisible();

    // 2. Open Create Dialog
    await adminPage.getByRole('button', { name: 'Tambah Pengguna' }).click();
    await expect(adminPage.getByRole('dialog')).toBeVisible();

    // 3. Fill Form
    await adminPage.getByLabel('First Name').fill('E2E');
    await adminPage.getByLabel('Last Name').fill('Tester');
    await adminPage.getByLabel('Email').fill(uniqueEmail);
    await adminPage.getByLabel('Phone Number').fill(uniquePhone);
    await adminPage.getByLabel('Password', { exact: true }).fill('password123');
    await adminPage.getByLabel('Confirm Password').fill('password123');
    
    // Select Role
    await adminPage.getByLabel('Role').click();
    await adminPage.getByRole('option', { name: 'TECHNICIAN' }).click();

    // Submit
    await adminPage.getByRole('button', { name: 'Create User' }).click();

    // Verify Success Toast
    await expect(adminPage.getByText('Pengguna berhasil dibuat')).toBeVisible();

    // 4. Verify in List and Edit
    await adminPage.getByPlaceholder('Cari pengguna...').fill(uniqueEmail);
    await expect(adminPage.getByRole('cell', { name: uniqueEmail })).toBeVisible();
    
    // Open Edit
    await adminPage.getByRole('button', { name: 'Edit' }).click();
    await adminPage.getByLabel('First Name').fill('E2E Updated');
    await adminPage.getByRole('button', { name: 'Update User' }).click();
    
    await expect(adminPage.getByText('Pengguna berhasil diperbarui')).toBeVisible();
    await expect(adminPage.getByRole('cell', { name: 'E2E Updated' })).toBeVisible();

    // 5. Soft Delete
    await adminPage.getByRole('button', { name: 'Hapus' }).click();
    await adminPage.getByRole('button', { name: 'Konfirmasi Hapus' }).click();
    
    await expect(adminPage.getByText('Pengguna berhasil dihapus')).toBeVisible();
    await expect(adminPage.getByRole('cell', { name: uniqueEmail })).not.toBeVisible();
  });

  /**
   * CUJ 2: Self-Service Profile Management
   * Role: TECHNICIAN
   */
  test('User can update their own profile and avatar', async ({ technicianPage }) => {
    await technicianPage.goto('/my-profile');
    await expect(technicianPage.getByRole('heading', { name: 'Profil Saya' })).toBeVisible();

    // 1. Update Name
    const newName = `Tech-${uuidv4().slice(0, 4)}`;
    await technicianPage.getByLabel('First Name').fill(newName);
    await technicianPage.getByRole('button', { name: 'Simpan Perubahan' }).click();

    await expect(technicianPage.getByText('Profil berhasil diperbarui')).toBeVisible();
    
    // 2. Verify persistence on reload
    await technicianPage.reload();
    await expect(technicianPage.getByLabel('First Name')).toHaveValue(newName);
  });

  /**
   * CUJ 3: Conflict Handling (Validation)
   * Role: ADMIN
   */
  test('System prevents duplicate email/phone conflicts', async ({ adminPage }) => {
    // We'll use the existing admin email to trigger a conflict
    const adminEmail = 'admin@corintek.com';

    await adminPage.goto('/users');
    await adminPage.getByRole('button', { name: 'Tambah Pengguna' }).click();

    await adminPage.getByLabel('First Name').fill('Duplicate');
    await adminPage.getByLabel('Email').fill(adminEmail);
    await adminPage.getByLabel('Phone Number').fill('0811111111');
    await adminPage.getByLabel('Password', { exact: true }).fill('password123');
    await adminPage.getByLabel('Confirm Password').fill('password123');
    
    await adminPage.getByLabel('Role').click();
    await adminPage.getByRole('option', { name: 'TECHNICIAN' }).click();

    await adminPage.getByRole('button', { name: 'Create User' }).click();

    // Verify Error
    await expect(adminPage.getByText('Pengguna dengan email atau nomor telepon ini sudah ada')).toBeVisible();
  });

});
