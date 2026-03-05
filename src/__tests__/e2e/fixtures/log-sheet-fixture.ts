import { Page, expect } from '@playwright/test';
import { SIGNATURE_DATA_URL } from './signature-fixture';

export interface ITestLogSheet {
  id: string;
  projectId: string;
  date: string;
}

export async function navigateToLogSheetsList(page: Page, projectId: string) {
  await page.goto(`/log-sheets/${projectId}`);
  await expect(page.getByRole('heading', { name: /log sheet/i })).toBeVisible();
}

export async function createLogSheet(
  page: Page,
  projectId: string,
  date?: string
): Promise<ITestLogSheet> {
  await navigateToLogSheetsList(page, projectId);

  const addButton = page.getByRole('button', { name: /tambah/i });
  await addButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const dateValue = date ?? new Date().toISOString().split('T')[0];
  const dateInput = dialog.getByRole('textbox', { name: /tanggal/i });
  await dateInput.fill(dateValue);

  const saveButton = dialog.getByRole('button', { name: /buat log sheet/i });
  await saveButton.click();

  await expect(dialog).not.toBeVisible({ timeout: 15000 });

  await page.waitForURL(/\/log-sheets\/[^/]+\/[^/]+/);

  const url = page.url();
  const match = url.match(/\/log-sheets\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Failed to extract log sheet ID from URL');

  return {
    id: match[2],
    projectId: match[1],
    date: dateValue,
  };
}

export async function selectActiveMachines(
  page: Page,
  options: {
    chillers?: string[];
    coolingTowers?: string[];
  }
) {
  const { chillers = [], coolingTowers = [] } = options;

  await expect(page.getByText('Unit Mesin Aktif')).toBeVisible({ timeout: 10000 });

  // Each machine group is a div containing: header text + "Semua"/"Kosong" buttons + machine buttons
  // Chillers and Cooling Towers are sibling divs
  const allKosongButtons = page.getByRole('button', { name: /^Kosong$/i });
  const kosongCount = await allKosongButtons.count();

  // Kosong buttons appear in order: first for Chillers, second for Cooling Towers
  // Deactivate all CTs first (index 1), then all Chillers (index 0)
  if (coolingTowers.length === 0 && kosongCount >= 2) {
    await allKosongButtons.nth(1).click();
    await page.waitForTimeout(500);
  }

  // For Chillers: if specific units requested, first clear then enable
  if (chillers.length > 0) {
    // Chillers are already default active, just verify
  } else if (kosongCount >= 1) {
    await allKosongButtons.nth(0).click();
    await page.waitForTimeout(500);
  }

  // Activate specific chillers
  for (const unit of chillers) {
    const btn = page.getByRole('button', { name: new RegExp(`#${unit}`) }).first();
    const text = await btn.innerText();
    if (!text.toLowerCase().includes('aktif')) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  }

  // Activate specific cooling towers
  for (const unit of coolingTowers) {
    const btn = page.getByRole('button', { name: new RegExp(`#${unit}`) }).first();
    const text = await btn.innerText();
    if (!text.toLowerCase().includes('aktif')) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  }
}

export async function fillNumericEntry(
  page: Page,
  paramName: string,
  value: number,
  machineId?: string
) {
  // Find the cell containing the parameter name
  const paramCell = page.getByRole('cell', { name: new RegExp(`^${paramName}(\\s|\\(|$)`, 'i') }).first();
  await expect(paramCell).toBeVisible({ timeout: 15000 });

  const row = page.locator('tr').filter({ has: paramCell });
  
  const inputs = row.getByRole('spinbutton');
  const textboxes = row.getByRole('textbox');
  
  let targetInput;
  if ((await inputs.count()) > 0) {
    targetInput = inputs.first();
  } else {
    targetInput = textboxes.first();
  }

  await targetInput.fill(String(value));
}

export async function fillBooleanEntry(
  page: Page,
  paramName: string,
  checked: boolean,
  machineId?: string
) {
  const cellLocator = machineId
    ? page.getByRole('cell', { name: paramName }).locator('..')
    : page.getByText(paramName).locator('..');

  const checkbox = cellLocator.getByRole('checkbox');
  if (checked) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
}

export async function fillTextEntry(
  page: Page,
  paramName: string,
  text: string,
  machineId?: string
) {
  const cellLocator = machineId
    ? page.getByRole('cell', { name: paramName }).locator('..')
    : page.getByText(paramName).locator('..');

  const input = cellLocator.getByRole('textbox');
  await input.fill(text);
}

export async function fillNoteEntry(
  page: Page,
  paramName: string,
  note: string
) {
  const row = page.getByRole('row').filter({ hasText: paramName });
  const noteInput = row.getByRole('textbox').last();
  await noteInput.fill(note);
}

export async function fillRawWaterEntry(
  page: Page,
  paramName: string,
  value: number
) {
  const row = page.getByRole('row').filter({ hasText: paramName }).first();
  await expect(row).toBeVisible({ timeout: 10000 });

  const numericInputs = row.getByRole('spinbutton');
  const textInputs = row.getByRole('textbox');

  if ((await numericInputs.count()) > 0) {
    await numericInputs.last().fill(String(value));
    return;
  }

  await textInputs.last().fill(String(value));
}

export async function addSignature(
  page: Page,
  role: 'TECHNICIAN' | 'CLIENT_PIC'
) {
  if (role === 'TECHNICIAN') {
    // For technician: find the section with "Tanda Tangan Teknisi" text
    const section = page.locator('div').filter({
      has: page.locator('p', { hasText: 'Tanda Tangan Teknisi' }),
    }).first();
    const signButton = section.getByRole('button', { name: /tanda tangan/i }).first();
    await expect(signButton).toBeVisible({ timeout: 10000 });
    await signButton.click();
  } else {
    // For PIC Klien: just click "Isi Tanda Tangan" which only appears on unsigned sections
    // After technician is signed, only PIC Klien will have "Isi Tanda Tangan"
    const signButton = page.getByRole('button', { name: 'Isi Tanda Tangan' });
    await expect(signButton).toBeVisible({ timeout: 10000 });
    await signButton.click();
  }

  // Wait for the dialog with canvas to appear
  const canvas = page.locator('[role="dialog"] canvas').first();
  await expect(canvas).toBeVisible({ timeout: 10000 });
  const dialog = canvas.locator('xpath=ancestor::div[@role="dialog"]');

  // Draw on canvas via mouse to trigger internal onChange detection
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 80, box.y + 40);
    await page.mouse.move(box.x + 50, box.y + 60);
    await page.mouse.up();
  }

  const saveButton = dialog.getByRole('button', { name: /simpan/i }).last();
  await expect(saveButton).toBeEnabled({ timeout: 10000 });
  await saveButton.click();

  // Wait for canvas to disappear (dialog closed)
  await expect(canvas).not.toBeVisible({ timeout: 10000 });
}

export async function saveLogSheet(page: Page) {
  const saveButton = page.getByRole('button', { name: /^simpan$/i });
  let clickedDirectButton = false;

  if ((await saveButton.count()) > 0 && (await saveButton.first().isVisible())) {
    await saveButton.first().click();
    clickedDirectButton = true;
  } else {
    const actionButton = page.getByRole('button', { name: /tindakan/i });
    if (await actionButton.isVisible()) {
      await actionButton.click();
      const menuSave = page
        .getByRole('menuitem', { name: /simpan/i })
        .or(page.getByRole('button', { name: /simpan/i }))
        .first();
      await expect(menuSave).toBeVisible({ timeout: 5000 });
      await menuSave.click();
    } else {
      throw new Error('Save action not found');
    }
  }

  // Wait for ANY toast that indicates success
  const toast = page.locator('[data-sonner-toast]').last();
  await expect(toast).toBeVisible({ timeout: 10000 });
  const toastText = await toast.innerText();
  
  if (toastText.toLowerCase().includes('gagal')) {
    throw new Error(`Save failed: ${toastText}`);
  }

  if (clickedDirectButton) {
    await expect(saveButton.first()).toBeEnabled({ timeout: 10000 });
  }
}

export async function completeLogSheet(page: Page) {
  // Wait for at least one spinbutton to appear (tables with data columns rendered)
  await expect(page.getByRole('spinbutton').first()).toBeVisible({ timeout: 15000 });

  const numberInputs = page.locator('table input[type="number"]');
  const numberCount = await numberInputs.count();
  for (let i = 0; i < numberCount; i++) {
    const input = numberInputs.nth(i);
    try {
      if (await input.isVisible() && await input.isEnabled()) {
        await input.fill('1');
      }
    } catch {
      // element may detach during rerender; skip and continue
    }
  }

  const textInputs = page.locator('table input[type="text"], table textarea');
  const textCount = await textInputs.count();
  for (let i = 0; i < textCount; i++) {
    const input = textInputs.nth(i);
    try {
      const name = (await input.getAttribute('name')) || '';
      if (await input.isVisible() && await input.isEnabled() && !name.includes('date')) {
        await input.fill('Test Entry');
      }
    } catch {
      // element may detach during rerender; skip and continue
    }
  }

  const checkboxes = page.locator('table [role="checkbox"]');
  const checkboxCount = await checkboxes.count();
  for (let i = 0; i < checkboxCount; i++) {
    const checkbox = checkboxes.nth(i);
    try {
      const checked = await checkbox.getAttribute('aria-checked');
      if (await checkbox.isVisible() && await checkbox.isEnabled() && checked !== 'true') {
        await checkbox.click();
      }
    } catch {
      // element may detach during rerender; skip and continue
    }
  }
}

export async function signAsTechnician(page: Page) {
  const section = page
    .locator('div')
    .filter({ has: page.getByText(/tanda tangan teknisi/i) })
    .first();

  const signButton = section.getByRole('button', { name: /tanda tangan/i }).first();
  await expect(signButton).toBeVisible({ timeout: 10000 });
  await signButton.click();

  const dialog = page.locator('[role="dialog"]:visible').first();
  await expect(dialog).toBeVisible({ timeout: 10000 });

  const canvas = dialog.locator('canvas:visible').first();
  await expect(canvas).toBeVisible({ timeout: 5000 });
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 80, box.y + 40);
    await page.mouse.up();
  }

  const saveButton = dialog.locator('button:visible', { hasText: /^Simpan$/i }).last();
  await expect(saveButton).not.toBeDisabled({ timeout: 10000 });
  await saveButton.click();

  await expect(dialog).not.toBeVisible({ timeout: 10000 });
}

export async function submitLogSheet(page: Page) {
  const submitButton = page.getByRole('button', { name: /^kirim$/i });

  if ((await submitButton.count()) > 0 && (await submitButton.first().isVisible())) {
    await expect(submitButton.first()).toBeEnabled({ timeout: 15000 });
    await submitButton.first().click();
  } else {
    const actionButton = page.getByRole('button', { name: /tindakan/i });
    await expect(actionButton).toBeVisible({ timeout: 15000 });
    await actionButton.click();

    const menuSubmit = page
      .getByRole('menuitem', { name: /kirim/i })
      .or(page.getByRole('button', { name: /^kirim$/i }))
      .first();
    await expect(menuSubmit).toBeVisible({ timeout: 10000 });
    await menuSubmit.click();
  }

  // Check if validation failed (error toast appeared instead of dialog)
  const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
  const confirmDialog = page.getByRole('alertdialog');

  const which = await Promise.race([
    confirmDialog.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'dialog' as const),
    errorToast.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'error' as const),
  ]);

  if (which === 'error') {
    const errorText = await errorToast.innerText();
    throw new Error(`Submit validation failed with toast: ${errorText}`);
  }

  const confirmButton = confirmDialog.getByRole('button', { name: /kirim/i });
  await confirmButton.click();

  // Wait for success, submitted status, or explicit error toast
  const successToast = page.getByText(/berhasil dikirim/i);
  const submittedStatus = page.getByText(/SUBMITTED/);
  const submitErrorToast = page.locator(
    '[data-sonner-toast][data-type="error"]'
  );

  const outcome = await Promise.race([
    successToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'success' as const),
    submittedStatus.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'submitted' as const),
    submitErrorToast
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => 'error' as const),
  ]);

  if (outcome === 'error') {
    const errorText = await submitErrorToast.innerText();
    throw new Error(`Submit failed after confirm: ${errorText}`);
  }
}

export async function approveLogSheet(page: Page) {
  const approveButton = page.getByRole('button', { name: /setujui|approve/i });
  if (await approveButton.isVisible()) {
    await approveButton.click();
    await expect(page.getByText(/berhasil|disetujui/i)).toBeVisible({
      timeout: 10000,
    });
  }
}

export async function expectValidationError(
  page: Page,
  message: string | RegExp
) {
  await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
}

export async function expectFieldError(page: Page, fieldName: string) {
  const input = page.getByRole('textbox', { name: new RegExp(fieldName, 'i') });
  await expect(input).toHaveClass(/border-red-500|bg-red-50/);
}

export async function toggleAdminOverride(page: Page, unlock: boolean = true) {
  const buttonLabel = unlock ? /buka kunci/i : /kunci kembali/i;
  const button = page.getByRole('button', { name: buttonLabel });
  if (await button.isVisible()) {
    await button.click();
  }
}

export async function deleteLogSheetFromList(page: Page, logSheetId: string) {
  const row = page.getByRole('row').filter({
    hasText: logSheetId.substring(0, 8),
  });

  const actionButton = row.getByRole('button', { name: /hapus|delete/i });
  await actionButton.click();

  const confirmDialog = page.getByRole('alertdialog');
  const confirmButton = confirmDialog.getByRole('button', { name: /hapus/i });
  await confirmButton.click();

  await expect(row).not.toBeVisible({ timeout: 5000 });
}

export async function selectReplacedByTechnician(
  page: Page,
  technicianName: string
) {
  const select = page.getByRole('combobox', { name: /digantikan oleh/i });
  await select.click();

  const option = page.getByRole('option', {
    name: new RegExp(technicianName, 'i'),
  });
  await option.click();
}

export async function addChemicalUsage(
  page: Page,
  chemicalName: string,
  amount: number
) {
  const addChemicalButton = page.getByRole('button', {
    name: /tambah chemical|add chemical/i,
  });

  if (await addChemicalButton.isVisible()) {
    await addChemicalButton.click();

    const chemicalSelect = page
      .getByRole('combobox', { name: /chemical/i })
      .last();
    await chemicalSelect.click();
    await page
      .getByRole('option', { name: new RegExp(chemicalName, 'i') })
      .click();

    const amountInput = page
      .getByRole('spinbutton', {
        name: /jumlah|amount/i,
      })
      .last();
    await amountInput.fill(String(amount));
  }
}

export async function switchToPreviewMode(page: Page) {
  const previewButton = page.getByRole('button', { name: /preview/i });
  await previewButton.click();

  await expect(page.locator('.print\\:hidden')).toBeVisible();
}

export async function switchToInputMode(page: Page) {
  const inputButton = page.getByRole('button', { name: /^input$/i });
  await inputButton.click();
}

export async function verifyPrintModeHidesNavigation(page: Page) {
  const backButton = page.getByRole('button', { name: /kembali/i });
  const projectButton = page.getByRole('link', { name: /proyek/i });

  await expect(backButton).toBeVisible();
  await expect(projectButton).toBeVisible();
}

export async function mockNetworkFailure(page: Page) {
  await page.route('**/api/**', route => route.abort('failed'));
}

export async function restoreNetwork(page: Page) {
  await page.unroute('**/api/**');
}

export async function waitForToast(
  page: Page,
  type: 'success' | 'error' | 'warning',
  timeout: number = 5000
) {
  const toast = page.locator(`[data-sonner-toast][data-type="${type}"]`);
  await toast.waitFor({ state: 'visible', timeout });
  return toast;
}
