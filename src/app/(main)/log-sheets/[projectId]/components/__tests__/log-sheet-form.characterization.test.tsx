/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateLogSheetAction = vi.fn();

vi.mock('@/features/log-sheets/actions', () => ({
  createLogSheetAction: (...args: unknown[]) =>
    mockCreateLogSheetAction(...args),
}));

vi.mock('../../[logSheetId]/hooks/use-log-sheet-technicians', () => ({
  useLogSheetTechnicians: () => ({
    technicians: [
      { id: 'tech-1', firstName: 'John', lastName: 'Doe' },
      { id: 'tech-2', firstName: 'Jane', lastName: 'Smith' },
    ],
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

async function renderForm(props?: {
  projectId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onCreated?: (id: string) => void;
}) {
  const { LogSheetForm } = await import('../log-sheet-form');
  return render(
    <LogSheetForm
      projectId={props?.projectId ?? 'p-1'}
      onSuccess={props?.onSuccess ?? vi.fn()}
      onCancel={props?.onCancel ?? vi.fn()}
      onCreated={props?.onCreated}
    />
  );
}

describe('LogSheetForm - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateLogSheetAction.mockResolvedValue({
      success: true,
      data: {
        id: 'ls-new',
        projectId: 'p-1',
        date: new Date(),
        status: 'DRAFT',
      },
    });
  });

  describe('initial rendering', () => {
    it('renders date input (main path)', async () => {
      await renderForm();
      expect(screen.queryByLabelText('Tanggal')).not.toBeNull();
    });

    it('renders notes textarea (main path)', async () => {
      await renderForm();
      expect(screen.queryByLabelText(/Catatan/)).not.toBeNull();
    });

    it('renders technician select (main path)', async () => {
      await renderForm();
      expect(screen.queryByLabelText(/Digantikan Oleh/)).not.toBeNull();
    });

    it('renders submit button (main path)', async () => {
      await renderForm();
      expect(screen.queryByText('Buat Log Sheet')).not.toBeNull();
    });

    it('renders cancel button (main path)', async () => {
      await renderForm();
      expect(screen.queryByText('Batal')).not.toBeNull();
    });

    it('has default date value set (main path)', async () => {
      await renderForm();
      const dateInput = screen.getByLabelText('Tanggal');
      expect((dateInput as HTMLInputElement).value).not.toBe('');
    });
  });

  describe('cancel action', () => {
    it('calls onCancel when cancel button clicked (main path)', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();
      await renderForm({ onCancel });

      const cancelBtn = screen.getByText('Batal');
      await user.click(cancelBtn);

      expect(onCancel).toHaveBeenCalled();
    });

    it('does not call onSuccess when cancel clicked (main path)', async () => {
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      await renderForm({ onSuccess });

      const cancelBtn = screen.getByText('Batal');
      await user.click(cancelBtn);

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('technician select', () => {
    it('renders technician options when opened (main path)', async () => {
      const user = userEvent.setup();
      await renderForm();

      const select = screen.getByRole('combobox');
      await user.click(select);

      const options = screen.getAllByText('John Doe');
      expect(options.length).toBeGreaterThan(0);
    });

    it('renders "no replacement" option (main path)', async () => {
      const user = userEvent.setup();
      await renderForm();

      const select = screen.getByRole('combobox');
      await user.click(select);

      const options = screen.getAllByText('- Tidak Ada Pengganti -');
      expect(options.length).toBeGreaterThan(0);
    });

    it('shows selected technician name after selection (main path)', async () => {
      const user = userEvent.setup();
      await renderForm();

      const select = screen.getByRole('combobox');
      await user.click(select);

      const options = screen.getAllByRole('option');
      const johnOption = options.find(opt =>
        opt.textContent?.includes('John Doe')
      );
      if (johnOption) {
        await user.click(johnOption);
      }

      const selectedItems = screen.getAllByText('John Doe');
      expect(selectedItems.length).toBeGreaterThan(0);
    });
  });

  describe('notes field', () => {
    it('accepts text input (main path)', async () => {
      const user = userEvent.setup();
      await renderForm();

      const notesInput = screen.getByLabelText(/Catatan/);
      await user.type(notesInput, 'Test notes');

      expect((notesInput as HTMLTextAreaElement).value).toBe('Test notes');
    });

    it('starts empty (main path)', async () => {
      await renderForm();

      const notesInput = screen.getByLabelText(/Catatan/);
      expect((notesInput as HTMLTextAreaElement).value).toBe('');
    });
  });

  describe('form structure', () => {
    it('has form element (main path)', async () => {
      await renderForm();
      const form = document.querySelector('form');
      expect(form).not.toBeNull();
    });

    it('submit button is not disabled initially (main path)', async () => {
      await renderForm();
      const submitBtn = screen.getByText('Buat Log Sheet');
      expect(submitBtn.hasAttribute('disabled')).toBe(false);
    });

    it('cancel button is not disabled initially (main path)', async () => {
      await renderForm();
      const cancelBtn = screen.getByText('Batal');
      expect(cancelBtn.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('project ID handling', () => {
    it('renders form for specified project (main path)', async () => {
      await renderForm({ projectId: 'custom-project' });
      expect(screen.queryByText('Buat Log Sheet')).not.toBeNull();
    });
  });

  describe('component behavior', () => {
    it('re-renders without errors when props change (edge case)', async () => {
      const { rerender } = await renderForm({ projectId: 'p-1' });

      const { LogSheetForm } = await import('../log-sheet-form');
      rerender(
        <LogSheetForm projectId="p-2" onSuccess={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.queryByText('Buat Log Sheet')).not.toBeNull();
    });
  });
});
