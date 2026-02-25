/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
const mockGetProjectsAction = vi.fn();
const mockGetLogSheetsByProjectAction = vi.fn();
const mockDeleteLogSheetAction = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ projectId: 'p-1' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('@/features/projects/actions', () => ({
  getProjectsAction: (...args: unknown[]) => mockGetProjectsAction(...args),
}));

vi.mock('@/features/log-sheets/actions', () => ({
  getLogSheetsByProjectAction: (...args: unknown[]) =>
    mockGetLogSheetsByProjectAction(...args),
  deleteLogSheetAction: (...args: unknown[]) =>
    mockDeleteLogSheetAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/components/data-table', () => ({
  DataTable: ({
    data,
    columns,
    emptyMessage,
  }: {
    data: unknown[];
    columns: unknown[];
    emptyMessage: string;
  }) => (
    <div data-testid="data-table">
      {data.length === 0 ? (
        <div>{emptyMessage}</div>
      ) : (
        <div data-testid="row-count">{data.length} rows</div>
      )}
    </div>
  ),
}));

vi.mock('./components/columns', () => ({
  getLogSheetColumns: () => [],
}));

vi.mock('@/features/log-sheets/components/log-sheet-dialog', () => ({
  LogSheetDialog: ({
    trigger,
    onCreated,
  }: {
    trigger: React.ReactNode;
    onCreated: (id: string) => void;
  }) => (
    <div data-testid="log-sheet-dialog" onClick={() => onCreated('new-ls-1')}>
      {trigger}
    </div>
  ),
}));

function createMockProject(overrides?: Record<string, unknown>) {
  return {
    id: 'p-1',
    name: 'Test Project',
    clientName: 'Test Client',
    status: 'ACTIVE',
    ...overrides,
  };
}

function createMockLogSheet(overrides?: Record<string, unknown>) {
  return {
    id: 'ls-1',
    date: '2024-01-15',
    status: 'DRAFT',
    ...overrides,
  };
}

async function renderPage() {
  const { default: ProjectLogSheetsPage } = await import('./page');
  return render(<ProjectLogSheetsPage />);
}

describe('ProjectLogSheetsPage - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectsAction.mockResolvedValue({
      success: true,
      data: [createMockProject()],
    });
    mockGetLogSheetsByProjectAction.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  describe('initial state', () => {
    it('shows loading spinner on mount (main path)', async () => {
      mockGetProjectsAction.mockImplementation(() => new Promise(() => {}));
      mockGetLogSheetsByProjectAction.mockImplementation(
        () => new Promise(() => {})
      );

      renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Memuat data...')).not.toBeNull();
      });
    });
  });

  describe('data fetching', () => {
    it('calls getProjectsAction on mount (main path)', async () => {
      await renderPage();

      expect(mockGetProjectsAction).toHaveBeenCalled();
    });

    it('calls getLogSheetsByProjectAction with projectId (main path)', async () => {
      await renderPage();

      expect(mockGetLogSheetsByProjectAction).toHaveBeenCalledWith('p-1');
    });

    it('displays project name when found (main path)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [createMockProject({ id: 'p-1', name: 'Alpha Project' })],
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Proyek: Alpha Project')).not.toBeNull();
      });
    });

    it('shows fallback text when project not found (edge case)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [createMockProject({ id: 'other-project' })],
      });

      await renderPage();

      await waitFor(() => {
        expect(
          screen.queryByText('Kelola log sheet per proyek.')
        ).not.toBeNull();
      });
    });
  });

  describe('log sheets display', () => {
    it('shows empty message when no log sheets (edge case)', async () => {
      mockGetLogSheetsByProjectAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await renderPage();

      await waitFor(() => {
        expect(
          screen.queryByText('Belum ada log sheet untuk proyek ini.')
        ).not.toBeNull();
      });
    });

    it('shows log sheets in table when data exists (main path)', async () => {
      mockGetLogSheetsByProjectAction.mockResolvedValueOnce({
        success: true,
        data: [createMockLogSheet()],
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByTestId('row-count')).not.toBeNull();
      });
    });

    it('handles null log sheets data (edge case)', async () => {
      mockGetLogSheetsByProjectAction.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await renderPage();

      await waitFor(() => {
        expect(
          screen.queryByText('Belum ada log sheet untuk proyek ini.')
        ).not.toBeNull();
      });
    });
  });

  describe('error handling', () => {
    it('shows error toast on fetch error (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetProjectsAction.mockRejectedValueOnce(new Error('Network error'));

      await renderPage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Terjadi kesalahan saat memuat data'
        );
      });
    });

    it('hides loading spinner after error (error condition)', async () => {
      mockGetProjectsAction.mockRejectedValueOnce(new Error('Network error'));

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Memuat data...')).toBeNull();
      });
    });
  });

  describe('rendering', () => {
    it('renders page title (main path)', async () => {
      await renderPage();

      expect(screen.queryByText('Log Sheet')).not.toBeNull();
    });

    it('renders back to project link (main path)', async () => {
      await renderPage();

      expect(screen.queryByText('Kembali ke Proyek')).not.toBeNull();
    });

    it('renders add log sheet button (main path)', async () => {
      await renderPage();

      expect(screen.queryByText('Tambah Log Sheet')).not.toBeNull();
    });

    it('renders LogSheetDialog component (main path)', async () => {
      await renderPage();

      expect(screen.queryByTestId('log-sheet-dialog')).not.toBeNull();
    });
  });

  describe('navigation', () => {
    it('back link points to correct URL (main path)', async () => {
      await renderPage();

      const backLink = screen.queryByText('Kembali ke Proyek');
      expect(backLink?.closest('a')?.getAttribute('href')).toBe(
        '/my-projects/p-1'
      );
    });
  });

  describe('dialog callback', () => {
    it('navigates to new log sheet onCreated callback (main path)', async () => {
      const user = userEvent.setup();
      await renderPage();

      const dialog = screen.getByTestId('log-sheet-dialog');
      await user.click(dialog);

      expect(mockPush).toHaveBeenCalledWith('/log-sheets/p-1/new-ls-1');
    });
  });

  describe('loading state transitions', () => {
    it('shows DataTable after loading completes (main path)', async () => {
      await renderPage();

      await waitFor(() => {
        expect(screen.queryByTestId('data-table')).not.toBeNull();
      });
    });

    it('hides loading spinner after loading completes (main path)', async () => {
      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Memuat data...')).toBeNull();
      });
    });
  });
});
