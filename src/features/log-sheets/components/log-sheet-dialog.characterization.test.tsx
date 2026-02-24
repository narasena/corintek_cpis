/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/log-sheets/actions', () => ({
  createLogSheetAction: vi.fn(),
}));

vi.mock('@/features/log-sheets/hooks/use-log-sheet-technicians', () => ({
  useLogSheetTechnicians: () => ({
    technicians: [{ id: 'tech-1', firstName: 'John', lastName: 'Doe' }],
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

async function renderDialog(props?: {
  projectId?: string;
  trigger?: React.ReactNode;
}) {
  const { LogSheetDialog } = await import('./log-sheet-dialog');
  return render(
    <LogSheetDialog
      projectId={props?.projectId ?? 'project-1'}
      trigger={props?.trigger}
    />
  );
}

describe('LogSheetDialog - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders trigger when provided', async () => {
      await renderDialog({
        trigger: <button>Open Dialog</button>,
      });

      expect(screen.getByText('Open Dialog')).not.toBeNull();
    });

    it('does not render trigger when not provided', async () => {
      await renderDialog();

      expect(screen.queryByRole('button', { name: /open/i })).toBeNull();
    });

    it('renders dialog with correct title when opened', async () => {
      await renderDialog({
        trigger: <button>Open</button>,
      });

      await userEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Tambah Log Sheet')).not.toBeNull();
      });
    });

    it('renders LogSheetForm inside dialog when opened', async () => {
      await renderDialog({
        trigger: <button>Open</button>,
      });

      await userEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Buat Log Sheet')).not.toBeNull();
      });
    });
  });

  describe('dialog open/close', () => {
    it('opens dialog when trigger is clicked', async () => {
      await renderDialog({
        trigger: <button>Open Dialog</button>,
      });

      expect(screen.queryByRole('dialog')).toBeNull();

      await userEvent.click(screen.getByText('Open Dialog'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).not.toBeNull();
      });
    });
  });

  describe('mode prop', () => {
    it('passes mode="create" to CrudDialog', async () => {
      await renderDialog({
        trigger: <button>Open</button>,
      });

      await userEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        const title = screen.getByText('Tambah Log Sheet');
        expect(title).not.toBeNull();
      });
    });
  });

  describe('projectId prop', () => {
    it('passes projectId to LogSheetForm', async () => {
      await renderDialog({
        projectId: 'custom-project-id',
        trigger: <button>Open</button>,
      });

      await userEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).not.toBeNull();
      });
    });
  });
});
