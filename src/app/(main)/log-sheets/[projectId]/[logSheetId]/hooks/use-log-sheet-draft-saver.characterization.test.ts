/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TEntryState, TEntryRole } from '../types';
import type { TChemicalUsageState } from '@/features/log-sheets/components/chemical-usage-section';
import { useLogSheetDraftSaver } from './use-log-sheet-draft-saver';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockUpdateLogSheetAction = vi.fn();
const mockUpdateLogSheetAdminOverrideAction = vi.fn();
const mockSaveLogSheetEntriesAction = vi.fn();
const mockSaveLogSheetChemicalsAction = vi.fn();
const mockUploadLogSheetImageAction = vi.fn();

vi.mock('@/features/log-sheets/actions', () => ({
  updateLogSheetAction: (...args: unknown[]) =>
    mockUpdateLogSheetAction(...args),
  updateLogSheetAdminOverrideAction: (...args: unknown[]) =>
    mockUpdateLogSheetAdminOverrideAction(...args),
  saveLogSheetEntriesAction: (...args: unknown[]) =>
    mockSaveLogSheetEntriesAction(...args),
  saveLogSheetChemicalsAction: (...args: unknown[]) =>
    mockSaveLogSheetChemicalsAction(...args),
  uploadLogSheetImageAction: (...args: unknown[]) =>
    mockUploadLogSheetImageAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createDefaultArgs() {
  return {
    projectId: 'p-1',
    logSheetId: 'ls-1',
    notes: '',
    replacedByUserId: null as string | null,
    entryState: {} as Record<string, TEntryState>,
    chemicalState: [] as TChemicalUsageState,
    reload: vi.fn().mockResolvedValue(undefined),
    allowAdminOverride: undefined as boolean | undefined,
  };
}

describe('useLogSheetDraftSaver (characterization)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateLogSheetAction.mockResolvedValue({ success: true });
    mockUpdateLogSheetAdminOverrideAction.mockResolvedValue({ success: true });
    mockSaveLogSheetEntriesAction.mockResolvedValue({ success: true });
    mockSaveLogSheetChemicalsAction.mockResolvedValue({ success: true });
    mockUploadLogSheetImageAction.mockResolvedValue({
      success: true,
      url: 'http://test.url',
    });
  });

  describe('saveDraft return value', () => {
    it('returns true when all operations succeed (main path)', async () => {
      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      const saveResult = await result.current.saveDraft(false);

      expect(saveResult).toBe(true);
    });

    it('returns false when header update fails (error condition)', async () => {
      mockUpdateLogSheetAction.mockResolvedValueOnce({
        success: false,
        error: 'Header error',
      });

      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      const saveResult = await result.current.saveDraft(false);

      expect(saveResult).toBe(false);
    });

    it('returns false when entries save fails (error condition)', async () => {
      mockSaveLogSheetEntriesAction.mockResolvedValueOnce({
        success: false,
        error: 'Entries error',
      });

      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      const saveResult = await result.current.saveDraft(false);

      expect(saveResult).toBe(false);
    });

    it('returns false when chemicals save fails (error condition)', async () => {
      mockSaveLogSheetChemicalsAction.mockResolvedValueOnce({
        success: false,
        error: 'Chemicals error',
      });

      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      const saveResult = await result.current.saveDraft(false);

      expect(saveResult).toBe(false);
    });
  });

  describe('header update', () => {
    it('calls updateLogSheetAction when allowAdminOverride is false (main path)', async () => {
      const args = createDefaultArgs();
      args.allowAdminOverride = false;
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUpdateLogSheetAction).toHaveBeenCalledWith({
        id: 'ls-1',
        notes: undefined,
        replacedByUserId: null,
      });
    });

    it('calls updateLogSheetAdminOverrideAction when allowAdminOverride is true (admin path)', async () => {
      const args = createDefaultArgs();
      args.allowAdminOverride = true;
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUpdateLogSheetAdminOverrideAction).toHaveBeenCalledWith({
        id: 'ls-1',
        notes: undefined,
        replacedByUserId: null,
      });
    });

    it('trims notes and passes as undefined when empty (edge case)', async () => {
      const args = createDefaultArgs();
      args.notes = '   ';
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUpdateLogSheetAction).toHaveBeenCalledWith(
        expect.objectContaining({ notes: undefined })
      );
    });

    it('passes trimmed notes when not empty (main path)', async () => {
      const args = createDefaultArgs();
      args.notes = '  some notes  ';
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUpdateLogSheetAction).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'some notes' })
      );
    });

    it('passes replacedByUserId when set (main path)', async () => {
      const args = createDefaultArgs();
      args.replacedByUserId = 'user-1' as unknown as null;
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUpdateLogSheetAction).toHaveBeenCalledWith(
        expect.objectContaining({ replacedByUserId: 'user-1' })
      );
    });
  });

  describe('entry state handling', () => {
    it('saves entries with parsed key components (main path)', async () => {
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:machine-1:VALUE': {
          valueType: 'NUMBER',
          numericValue: 42,
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [
          expect.objectContaining({
            parameterId: 'param-1',
            machineId: 'machine-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 42,
          }),
        ],
        adminOverride: undefined,
      });
    });

    it('handles null machineId in key (edge case)', async () => {
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 10,
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [expect.objectContaining({ machineId: null })],
        adminOverride: undefined,
      });
    });

    it('handles BOOLEAN valueType (main path)', async () => {
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'BOOLEAN',
          boolValue: true,
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [
          expect.objectContaining({ valueType: 'BOOLEAN', boolValue: true }),
        ],
        adminOverride: undefined,
      });
    });

    it('handles TEXT valueType (main path)', async () => {
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:NOTE': {
          valueType: 'TEXT',
          textValue: 'Some note',
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [
          expect.objectContaining({
            valueType: 'TEXT',
            textValue: 'Some note',
          }),
        ],
        adminOverride: undefined,
      });
    });

    it('passes adminOverride to entries action when set (main path)', async () => {
      const args = createDefaultArgs();
      args.allowAdminOverride = true;
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith(
        expect.objectContaining({ adminOverride: true })
      );
    });
  });

  describe('file upload', () => {
    it('uploads pending file before saving entry (main path)', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 100,
          pendingFile: mockFile,
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUploadLogSheetImageAction).toHaveBeenCalled();
      const formData = mockUploadLogSheetImageAction.mock
        .calls[0][0] as FormData;
      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('projectId')).toBe('p-1');
      expect(formData.get('logSheetId')).toBe('ls-1');
    });

    it('uses uploaded URL as fileUrl in entry (main path)', async () => {
      mockUploadLogSheetImageAction.mockResolvedValueOnce({
        success: true,
        url: 'http://uploaded.url/image.jpg',
      });

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 100,
          pendingFile: mockFile,
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [
          expect.objectContaining({ fileUrl: 'http://uploaded.url/image.jpg' }),
        ],
        adminOverride: undefined,
      });
    });

    it('falls back to existing fileUrl when upload fails (error condition)', async () => {
      mockUploadLogSheetImageAction.mockResolvedValueOnce({
        success: false,
        error: 'Upload failed',
      });

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 100,
          pendingFile: mockFile,
          fileUrl: 'http://existing.url/old.jpg',
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [
          expect.objectContaining({ fileUrl: 'http://existing.url/old.jpg' }),
        ],
        adminOverride: undefined,
      });
    });

    it('continues saving other entries when one file upload throws (error condition)', async () => {
      mockUploadLogSheetImageAction.mockRejectedValueOnce(
        new Error('Network error')
      );

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 100,
          pendingFile: mockFile,
        } as TEntryState,
        'param-2:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 200,
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      const saveResult = await result.current.saveDraft(false);

      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalled();
      expect(saveResult).toBe(true);
    });

    it('uses existing fileUrl when no pendingFile (main path)', async () => {
      const args = createDefaultArgs();
      args.entryState = {
        'param-1:null:VALUE': {
          valueType: 'NUMBER',
          numericValue: 100,
          fileUrl: 'http://existing.url/photo.jpg',
        } as TEntryState,
      };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockUploadLogSheetImageAction).not.toHaveBeenCalled();
      expect(mockSaveLogSheetEntriesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        entries: [
          expect.objectContaining({ fileUrl: 'http://existing.url/photo.jpg' }),
        ],
        adminOverride: undefined,
      });
    });
  });

  describe('chemical usage handling', () => {
    it('saves chemical usages with amount > 0 (main path)', async () => {
      const args = createDefaultArgs();
      args.chemicalState = [
        {
          id: 'cu-1',
          chemicalId: 'ch-1',
          amount: 10,
          chemicalName: 'Chem A',
          unit: 'L',
        },
        {
          id: 'cu-2',
          chemicalId: 'ch-2',
          amount: 20,
          chemicalName: 'Chem B',
          unit: 'kg',
        },
      ];
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetChemicalsAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        usages: [
          { id: 'cu-1', chemicalId: 'ch-1', amount: 10 },
          { id: 'cu-2', chemicalId: 'ch-2', amount: 20 },
        ],
        adminOverride: undefined,
      });
    });

    it('filters out chemicals with amount <= 0 (edge case)', async () => {
      const args = createDefaultArgs();
      args.chemicalState = [
        { chemicalId: 'ch-1', amount: 10 },
        { chemicalId: 'ch-2', amount: 0 },
        { chemicalId: 'ch-3', amount: -5 },
      ];
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetChemicalsAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        usages: [{ chemicalId: 'ch-1', amount: 10 }],
        adminOverride: undefined,
      });
    });

    it('filters out chemicals without chemicalId (edge case)', async () => {
      const args = createDefaultArgs();
      args.chemicalState = [
        { chemicalId: 'ch-1', amount: 10 },
        { chemicalId: '', amount: 20 },
        { chemicalId: undefined as any, amount: 30 },
      ];
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetChemicalsAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        usages: [{ chemicalId: 'ch-1', amount: 10 }],
        adminOverride: undefined,
      });
    });

    it('passes adminOverride to chemicals action when set (main path)', async () => {
      const args = createDefaultArgs();
      args.allowAdminOverride = true;
      args.chemicalState = [{ chemicalId: 'ch-1', amount: 10 }];
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetChemicalsAction).toHaveBeenCalledWith(
        expect.objectContaining({ adminOverride: true })
      );
    });

    it('saves empty chemical array when no chemicals (edge case)', async () => {
      const args = createDefaultArgs();
      args.chemicalState = [];
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockSaveLogSheetChemicalsAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        usages: [],
        adminOverride: undefined,
      });
    });
  });

  describe('reload and refresh', () => {
    it('calls router.refresh after save (main path)', async () => {
      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('calls reload after router.refresh (main path)', async () => {
      const reload = vi.fn().mockResolvedValue(undefined);
      const args = { ...createDefaultArgs(), reload };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(reload).toHaveBeenCalled();
    });

    it('still calls reload even when save fails (error condition)', async () => {
      mockSaveLogSheetEntriesAction.mockResolvedValueOnce({
        success: false,
        error: 'Error',
      });
      const reload = vi.fn().mockResolvedValue(undefined);
      const args = { ...createDefaultArgs(), reload };
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(reload).toHaveBeenCalled();
    });
  });

  describe('showToast parameter', () => {
    it('shows success toast when showToast is true and save succeeds (main path)', async () => {
      const { toast } = await import('sonner');
      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(true);

      expect(toast.success).toHaveBeenCalledWith('Log sheet berhasil disimpan');
    });

    it('does not show success toast when showToast is false (main path)', async () => {
      const { toast } = await import('sonner');
      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      await result.current.saveDraft(false);

      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('return value structure', () => {
    it('returns saveDraft function', () => {
      const args = createDefaultArgs();
      const { result } = renderHook(() => useLogSheetDraftSaver(args));

      expect(typeof result.current.saveDraft).toBe('function');
    });
  });
});
