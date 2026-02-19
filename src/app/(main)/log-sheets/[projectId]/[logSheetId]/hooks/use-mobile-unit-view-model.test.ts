import { describe, it, expect, vi } from 'vitest';

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useMemo: <T>(factory: () => T) => factory(),
  };
});

vi.mock('@/features/log-sheets/option-a/unit-view-model-builder', () => {
  class FakeBuilder {}
  return {
    LogSheetUnitViewModelBuilder: FakeBuilder,
  };
});

vi.mock('@/features/log-sheets/option-a/mobile-view-adapter', () => {
  return {
    buildMobileUnitViewModelForLogSheet: vi.fn(),
  };
});

import type {
  ILogSheetUnitViewModel,
  ILogSheetDetailSnapshot,
  TReadonlyEntryStateMap,
} from '@/features/log-sheets/option-a/contracts';
import { buildMobileUnitViewModelForLogSheet } from '@/features/log-sheets/option-a/mobile-view-adapter';

import type { TDetail, TEntryState } from '../types';
import { useMobileUnitViewModel } from './use-mobile-unit-view-model';

describe('useMobileUnitViewModel', () => {
  it('returns null when detail is null', () => {
    const entryState: Record<string, TEntryState> = {};

    const result = useMobileUnitViewModel(null, entryState);

    expect(result).toBeNull();
    const buildMock = vi.mocked(buildMobileUnitViewModelForLogSheet);
    expect(buildMock).not.toHaveBeenCalled();
  });

  it('maps detail and entryState and calls adapter with correct payload', () => {
    const detail: TDetail = {
      viewerRole: 'ADMIN',
      logSheet: {
        id: 'ls-1',
        projectId: 'proj-1',
        date: '2024-01-01',
        notes: 'n',
        status: 'SUBMITTED',
        technicianSignatureUrl: null,
        technicianSignedAt: null,
        technicianSignedByUserId: null,
        clientPicSignatureUrl: null,
        clientPicSignedAt: null,
        clientPicSignedByUserId: null,
        submittedAt: null,
        submittedByUserId: null,
        approvedAt: null,
        approvedByUserId: null,
        replacedBy: null,
        submittedBy: null,
        approvedBy: null,
        technicianSignedBy: null,
        clientPicSignedBy: null,
      },
      project: {
        id: 'proj-1',
        name: 'Project',
        clientName: 'Client',
        assignments: [],
      },
      machines: {
        chillers: [{ id: 'ch-1', unitNumber: 1, type: 'CHILLER' }],
        coolingTowers: [],
      },
      parameters: [
        {
          id: 'param-1',
          name: 'Param',
          variableName: 'p1',
          category: 'UNIT_EVAPORATOR',
          valueType: 'NUMBER',
          unit: 'C',
          minValue: 0,
          maxValue: 10,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 1,
        },
      ],
      entries: [
        {
          parameterId: 'param-1',
          machineId: 'ch-1',
          role: 'VALUE',
          valueType: 'NUMBER',
          numericValue: 5,
          boolValue: null,
          textValue: null,
          fileUrl: null,
        },
      ],
      photos: [],
      chemicalUsages: [],
      activeMachineIds: {
        chillers: ['ch-1'],
        coolingTowers: [],
      },
    };

    const entryState: Record<string, TEntryState> = {
      'param-1:ch-1:VALUE': {
        valueType: 'NUMBER',
        numericValue: 5,
      },
    };

    const fakeViewModel: ILogSheetUnitViewModel = {
      units: [],
      activeUnitId: null,
      categoriesByUnit: new Map(),
      summaryFields: [],
    };

    const buildMock = vi.mocked(buildMobileUnitViewModelForLogSheet);
    buildMock.mockReturnValue(fakeViewModel);

    const result = useMobileUnitViewModel(detail, entryState);

    expect(result).toBe(fakeViewModel);
    expect(buildMock).toHaveBeenCalledTimes(1);

    const callArgs = buildMock.mock.calls[0]?.[0];
    const snapshot = callArgs.detail as ILogSheetDetailSnapshot;
    const stateMap = callArgs.entryState as TReadonlyEntryStateMap;

    expect(snapshot.header.id).toBe('ls-1');
    expect(snapshot.header.projectId).toBe('proj-1');
    expect(snapshot.header.notes).toBe('n');
    expect(snapshot.header.status).toBe('SUBMITTED');
    expect(snapshot.header.locked).toBe(true);
    expect(snapshot.header.date).toBeInstanceOf(Date);

    expect(snapshot.project).toEqual({
      id: 'proj-1',
      name: 'Project',
      clientName: 'Client',
    });

    expect(snapshot.machines.chillers).toHaveLength(1);
    expect(snapshot.machines.chillers[0].id).toBe('ch-1');
    expect(snapshot.parameters).toHaveLength(1);
    expect(snapshot.entries).toHaveLength(1);
    expect(snapshot.entries[0]).toMatchObject({
      logSheetId: 'ls-1',
      parameterId: 'param-1',
      machineId: 'ch-1',
      role: 'VALUE',
      valueType: 'NUMBER',
      numericValue: 5,
    });
    expect(snapshot.activeMachineIds.chillers).toEqual(['ch-1']);

    expect(stateMap['param-1:ch-1:VALUE']).toEqual({
      valueType: 'NUMBER',
      numericValue: 5,
      boolValue: undefined,
      textValue: undefined,
      fileUrl: undefined,
    });

    expect(callArgs.config).toEqual({
      featureEnabled: true,
      maxVisibleUnits: 1,
      defaultViewMode: 'unit-first',
      unitSortStrategy: 'byUnitNumber',
    });
  });

  it('sets locked flag to false when status is DRAFT', () => {
    const detail: TDetail = {
      viewerRole: 'ADMIN',
      logSheet: {
        id: 'ls-2',
        projectId: 'proj-2',
        date: new Date('2024-02-01'),
        notes: null,
        status: 'DRAFT',
        technicianSignatureUrl: null,
        technicianSignedAt: null,
        technicianSignedByUserId: null,
        clientPicSignatureUrl: null,
        clientPicSignedAt: null,
        clientPicSignedByUserId: null,
        submittedAt: null,
        submittedByUserId: null,
        approvedAt: null,
        approvedByUserId: null,
        replacedBy: null,
        submittedBy: null,
        approvedBy: null,
        technicianSignedBy: null,
        clientPicSignedBy: null,
      },
      project: {
        id: 'proj-2',
        name: 'Project 2',
        clientName: null,
        assignments: [],
      },
      machines: {
        chillers: [],
        coolingTowers: [],
      },
      parameters: [],
      entries: [],
      photos: [],
      chemicalUsages: [],
      activeMachineIds: {
        chillers: [],
        coolingTowers: [],
      },
    };

    const entryState: Record<string, TEntryState> = {};
    const buildMock = vi.mocked(buildMobileUnitViewModelForLogSheet);
    buildMock.mockClear();

    useMobileUnitViewModel(detail, entryState);

    expect(buildMock).toHaveBeenCalledTimes(1);

    const callArgs = buildMock.mock.calls[0]?.[0];
    const snapshot = callArgs.detail as ILogSheetDetailSnapshot;

    expect(snapshot.header.locked).toBe(false);
  });
});
