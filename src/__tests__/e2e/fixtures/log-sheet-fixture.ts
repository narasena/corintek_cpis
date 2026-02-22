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

  const saveButton = dialog.getByRole('button', { name: /simpan/i });
  await saveButton.click();

  await expect(dialog).not.toBeVisible();

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

  for (const chillerId of chillers) {
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(chillerId),
    });
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  for (const ctId of coolingTowers) {
    const checkbox = page.getByRole('checkbox', { name: new RegExp(ctId) });
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }
}

export async function fillNumericEntry(
  page: Page,
  paramName: string,
  value: number,
  machineId?: string
) {
  const cellLocator = machineId
    ? page.getByRole('cell', { name: paramName }).locator('..')
    : page.getByText(paramName).locator('..');

  const input = machineId
    ? cellLocator.getByRole('textbox').nth(1)
    : cellLocator.getByRole('textbox').first();

  await input.fill(String(value));
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
  const row = page.getByText(paramName).locator('..');
  const rawWaterInput = row.getByRole('textbox').last();
  await rawWaterInput.fill(String(value));
}

export async function addSignature(
  page: Page,
  role: 'TECHNICIAN' | 'CLIENT_PIC'
) {
  const sectionLabel = role === 'TECHNICIAN' ? /teknisi/i : /pic klien/i;
  const section = page
    .locator('div')
    .filter({ has: page.getByText(sectionLabel) })
    .nth(0);

  const signButton = section.getByRole('button', { name: /tanda tangan/i });
  await signButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.evaluate(
    ({ selector, dataUrl }) => {
      const canvas = document.querySelector(selector) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = dataUrl;
        }
      }
    },
    {
      selector: 'canvas',
      dataUrl: SIGNATURE_DATA_URL,
    }
  );

  const saveButton = dialog.getByRole('button', { name: /simpan/i });
  await saveButton.click();

  await expect(dialog).not.toBeVisible();
}

export async function saveLogSheet(page: Page) {
  const saveButton = page.getByRole('button', { name: /^simpan$/i });
  await saveButton.click();

  await expect(page.getByText(/berhasil|disimpan/i)).toBeVisible({
    timeout: 10000,
  });
}

export async function submitLogSheet(page: Page) {
  const submitButton = page.getByRole('button', { name: /kirim$/i });
  await submitButton.click();

  const confirmDialog = page.getByRole('alertdialog');
  await expect(confirmDialog).toBeVisible();

  const confirmButton = confirmDialog.getByRole('button', { name: /kirim/i });
  await confirmButton.click();

  await expect(page.getByText(/berhasil dikirim/i)).toBeVisible({
    timeout: 10000,
  });
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
