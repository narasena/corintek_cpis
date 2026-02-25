/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetProjectsAction = vi.fn();

vi.mock('@/features/projects/actions', () => ({
  getProjectsAction: (...args: unknown[]) => mockGetProjectsAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/components/data-table', () => ({
  DataTable: ({
    data,
    emptyMessage,
  }: {
    data: unknown[];
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

vi.mock('./components/project-columns', () => ({
  getLogSheetProjectColumns: () => [],
}));

function createMockProject(overrides?: Record<string, unknown>) {
  return {
    id: 'p-1',
    name: 'Test Project',
    clientName: 'Test Client',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

async function renderPage() {
  const { default: LogSheetsPage } = await import('./page');
  return render(<LogSheetsPage />);
}

describe('LogSheetsPage (root) - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('shows loading spinner on mount (main path)', async () => {
      mockGetProjectsAction.mockImplementation(() => new Promise(() => {}));

      renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Memuat data...')).not.toBeNull();
      });
    });
  });

  describe('data fetching', () => {
    it('calls getProjectsAction on mount (main path)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await renderPage();

      expect(mockGetProjectsAction).toHaveBeenCalledTimes(1);
    });

    it('displays projects in DataTable when fetch succeeds (main path)', async () => {
      const mockProjects = [
        createMockProject({ id: 'p-1', name: 'Project 1' }),
        createMockProject({ id: 'p-2', name: 'Project 2' }),
      ];
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: mockProjects,
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByTestId('row-count')).not.toBeNull();
      });
    });

    it('shows empty message when no projects (edge case)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Belum ada data proyek.')).not.toBeNull();
      });
    });

    it('shows empty message when data is null (edge case)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Belum ada data proyek.')).not.toBeNull();
      });
    });

    it('shows empty message when data is undefined (edge case)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Belum ada data proyek.')).not.toBeNull();
      });
    });
  });

  describe('error handling', () => {
    it('shows error toast when action returns success: false (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetProjectsAction.mockResolvedValueOnce({
        success: false,
        error: 'Database error',
      });

      await renderPage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Gagal mengambil data proyek');
      });
    });

    it('shows error toast when action throws (error condition)', async () => {
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
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await renderPage();

      expect(screen.queryByText('Log Sheet')).not.toBeNull();
    });

    it('renders page description (main path)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await renderPage();

      expect(
        screen.queryByText('Pilih proyek untuk mengelola log sheet.')
      ).not.toBeNull();
    });

    it('hides loading spinner after successful fetch (main path)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Memuat data...')).toBeNull();
      });
    });
  });

  describe('loading state behavior', () => {
    it('shows loading spinner while loading and no data (main path)', async () => {
      mockGetProjectsAction.mockImplementation(() => new Promise(() => {}));

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByText('Memuat data...')).not.toBeNull();
      });
    });

    it('shows DataTable when loading completes with data (main path)', async () => {
      mockGetProjectsAction.mockResolvedValueOnce({
        success: true,
        data: [createMockProject()],
      });

      await renderPage();

      await waitFor(() => {
        expect(screen.queryByTestId('data-table')).not.toBeNull();
      });
    });
  });
});
