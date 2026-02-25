import { describe, expect, it } from 'vitest';

import type { IProject } from '@/features/projects/types';
import { getLogSheetProjectColumns } from './project-columns';

describe('getLogSheetProjectColumns (characterization)', () => {
  describe('column definitions', () => {
    it('returns array of ColumnDef (main path)', () => {
      const columns = getLogSheetProjectColumns();

      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('includes name column with accessorKey "name" (main path)', () => {
      const columns = getLogSheetProjectColumns();

      const nameColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'name'
      );
      expect(nameColumn).toBeDefined();
    });

    it('includes client column with accessorKey "client" (main path)', () => {
      const columns = getLogSheetProjectColumns();

      const clientColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'client'
      );
      expect(clientColumn).toBeDefined();
    });

    it('includes actions column with id "actions" (main path)', () => {
      const columns = getLogSheetProjectColumns();

      const actionsColumn = columns.find(c => 'id' in c && c.id === 'actions');
      expect(actionsColumn).toBeDefined();
    });
  });

  describe('name column', () => {
    it('has header "Proyek" (main path)', () => {
      const columns = getLogSheetProjectColumns();

      const nameColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'name'
      );
      expect(nameColumn).toBeDefined();
      expect('header' in nameColumn! && nameColumn.header).toBe('Proyek');
    });
  });

  describe('client column cell', () => {
    it('renders client name when client exists (main path)', () => {
      const columns = getLogSheetProjectColumns();

      const clientColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'client'
      );
      expect(clientColumn).toBeDefined();
      expect('cell' in clientColumn! && clientColumn.cell).toBeDefined();
    });

    it('renders dash when client is null (edge case)', () => {
      const columns = getLogSheetProjectColumns();

      const clientColumn = columns.find(
        c => 'accessorKey' in c && c.accessorKey === 'client'
      );
      expect(clientColumn).toBeDefined();
      expect('cell' in clientColumn! && clientColumn.cell).toBeDefined();
    });
  });

  describe('actions column', () => {
    it('renders Button with link to log-sheets/[id] (main path)', () => {
      const columns = getLogSheetProjectColumns();

      const actionsColumn = columns.find(c => 'id' in c && c.id === 'actions');
      expect(actionsColumn).toBeDefined();
      expect('cell' in actionsColumn! && actionsColumn.cell).toBeDefined();
      expect('header' in actionsColumn! && actionsColumn.header).toBe('Aksi');
    });
  });

  describe('column count', () => {
    it('returns exactly 3 columns (main path)', () => {
      const columns = getLogSheetProjectColumns();

      expect(columns.length).toBe(3);
    });
  });
});
