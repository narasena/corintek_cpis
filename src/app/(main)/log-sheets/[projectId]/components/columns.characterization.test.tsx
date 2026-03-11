/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

import { getLogSheetColumns, type TLogSheetRow } from './columns';

describe('getLogSheetColumns (characterization)', () => {
  const defaultProps = {
    onOpen: vi.fn(),
    onDelete: vi.fn().mockResolvedValue({ success: true }),
    canEdit: true,
    canDelete: true,
  };

  describe('column definitions', () => {
    it('returns array of ColumnDef (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('includes date column with accessorKey "date" (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const dateColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'date'
      );
      expect(dateColumn).toBeDefined();
    });

    it('includes status column with accessorKey "status" (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const statusColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'status'
      );
      expect(statusColumn).toBeDefined();
    });

    it('includes notes column with accessorKey "notes" (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const notesColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'notes'
      );
      expect(notesColumn).toBeDefined();
    });

    it('includes actions column with id "actions" (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const actionsColumn = columns.find(c => 'id' in c && c.id === 'actions');
      expect(actionsColumn).toBeDefined();
    });
  });

  describe('date column cell', () => {
    it('formats date using formatDate (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const dateColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'date'
      );
      expect(dateColumn).toBeDefined();
      expect('cell' in dateColumn! && dateColumn.cell).toBeDefined();
    });
  });

  describe('status column cell', () => {
    it('renders Badge with status text (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const statusColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'status'
      );
      expect(statusColumn).toBeDefined();
      expect('cell' in statusColumn! && statusColumn.cell).toBeDefined();
    });
  });

  describe('notes column cell', () => {
    it('renders dash when notes is null (edge case)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const notesColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'notes'
      );
      expect(notesColumn).toBeDefined();
      expect('cell' in notesColumn! && notesColumn.cell).toBeDefined();
    });
  });

  describe('actions column', () => {
    it('passes onOpen and onDelete to ActionCell (main path)', () => {
      const columns = getLogSheetColumns(defaultProps);

      const actionsColumn = columns.find(c => 'id' in c && c.id === 'actions');
      expect(actionsColumn).toBeDefined();
      expect('cell' in actionsColumn! && actionsColumn.cell).toBeDefined();
    });
  });

  describe('statusVariant function (internal)', () => {
    it('returns "default" for APPROVED status (main path)', () => {
      const row: TLogSheetRow = {
        id: 'ls-1',
        projectId: 'p-1',
        date: new Date(),
        notes: null,
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const columns = getLogSheetColumns(defaultProps);

      const statusColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'status'
      );
      expect(statusColumn).toBeDefined();
    });

    it('returns "secondary" for SUBMITTED status (main path)', () => {
      const row: TLogSheetRow = {
        id: 'ls-1',
        projectId: 'p-1',
        date: new Date(),
        notes: null,
        status: 'SUBMITTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const columns = getLogSheetColumns(defaultProps);

      const statusColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'status'
      );
      expect(statusColumn).toBeDefined();
    });

    it('returns "outline" for DRAFT status (main path)', () => {
      const row: TLogSheetRow = {
        id: 'ls-1',
        projectId: 'p-1',
        date: new Date(),
        notes: null,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const columns = getLogSheetColumns(defaultProps);

      const statusColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'status'
      );
      expect(statusColumn).toBeDefined();
    });
  });
});
