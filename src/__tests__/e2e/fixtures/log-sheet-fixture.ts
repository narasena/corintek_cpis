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
  const section = page.getByText(
    role === 'TECHNICIAN' ? /teknisi/i : /pic klien/i
  );

  const signButton = section.getByRole('button', { name: /tanda tangan/i });
  await signButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const canvas = dialog.getByRole('img');
  await canvas.click();

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

export async function toggleAdminOverride(page: Page) {
  const unlockButton = page.getByRole('button', { name: /buka kunci/i });
  await unlockButton.click();
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
