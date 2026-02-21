import { Page, Locator } from '@playwright/test';

export async function fillForm(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [label, value] of Object.entries(fields)) {
    const input = page.getByRole('textbox', { name: new RegExp(label, 'i') });
    await input.fill(value);
  }
}

export async function selectDropdown(
  page: Page,
  label: string,
  value: string
): Promise<void> {
  const trigger = page.getByRole('combobox', { name: new RegExp(label, 'i') });
  await trigger.click();

  const option = page.getByRole('option', { name: new RegExp(value, 'i') });
  await option.click();
}

export async function checkCheckbox(
  page: Page,
  label: string,
  checked: boolean = true
): Promise<void> {
  const checkbox = page.getByRole('checkbox', { name: new RegExp(label, 'i') });
  if (checked) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
}

export async function submitForm(
  page: Page,
  buttonLabel: string | RegExp = /simpan|submit|save/i
): Promise<void> {
  const button = page.getByRole('button', { name: buttonLabel });
  await button.click();
}

export async function waitForToast(
  page: Page,
  type: 'success' | 'error' | 'warning',
  timeout: number = 5000
): Promise<Locator> {
  const toastSelector = `[data-sonner-toast][data-type="${type}"]`;
  const toast = page.locator(toastSelector);
  await toast.waitFor({ state: 'visible', timeout });
  return toast;
}

export async function expectFormError(
  page: Page,
  errorMessage: string | RegExp
): Promise<void> {
  const error = page.getByText(errorMessage);
  await error.waitFor({ state: 'visible' });
}

export async function closeModal(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: /close|tutup|batal/i });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}

export async function confirmDialog(page: Page): Promise<void> {
  const confirmButton = page
    .getByRole('alertdialog')
    .getByRole('button', { name: /ya|konfirmasi|hapus|kirim/i });
  await confirmButton.click();
}

export async function cancelDialog(page: Page): Promise<void> {
  const cancelButton = page
    .getByRole('alertdialog')
    .getByRole('button', { name: /batal|cancel/i });
  await cancelButton.click();
}
