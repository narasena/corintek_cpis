import { vi } from 'vitest';
import { ILogSheetServiceData } from '@/types/log-sheet.type';
import { IParameterGroupForSchema } from '@/types/log-sheet.type';
import { ValueType } from '@/features/api/generated/prisma/enums';

/**
 * Test helper utilities for log sheet tests
 */

/**
 * Creates a mock NextRequest object for testing
 */
export const createMockRequest = (body: any) => ({
  json: vi.fn().mockResolvedValue(body),
  headers: new Map(),
  method: 'POST',
  url: 'http://localhost:3000/api/v1/projects/test/log-sheets',
});

/**
 * Creates a mock Prisma transaction object
 */
export const createMockTransaction = () => ({
  logSheet: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  logSheetHistory: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  logSheetDetail: {
    createMany: vi.fn(),
    findMany: vi.fn(),
  },
  machine: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  parameterGroup: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
  },
});

/**
 * Creates mock parameter groups for testing
 */
export const createMockParameterGroups = (): IParameterGroupForSchema[] => [
  {
    id: 'chiller-evaporator',
    name: 'Unit Evaporator',
    description: 'Chiller evaporator parameters',
    members: [
      {
        parameter: {
          id: 'temp-in',
          name: 'Temperature In',
          valueType: ValueType.NUMBER,
          unit: '°C',
          description: 'Inlet temperature',
        },
      },
      {
        parameter: {
          id: 'temp-out',
          name: 'Temperature Out',
          valueType: ValueType.NUMBER,
          unit: '°C',
          description: 'Outlet temperature',
        },
      },
    ],
  },
  {
    id: 'general',
    name: 'General Parameters',
    description: 'General system parameters',
    members: [
      {
        parameter: {
          id: 'ambient-temp',
          name: 'Ambient Temperature',
          valueType: ValueType.NUMBER,
          unit: '°C',
          description: 'Ambient temperature',
        },
      },
      {
        parameter: {
          id: 'observations',
          name: 'Observations',
          valueType: ValueType.TEXT,
          description: 'General observations',
        },
      },
    ],
  },
];

/**
 * Creates mock machines for testing
 */
export const createMockMachines = () => [
  {
    id: 'chiller-1',
    unitNumber: 1,
    type: 'CHILLER',
    projectId: 'test-project-id',
  },
  {
    id: 'chiller-2',
    unitNumber: 2,
    type: 'CHILLER',
    projectId: 'test-project-id',
  },
];

/**
 * Creates mock project data for testing
 */
export const createMockProject = () => ({
  id: 'test-project-id',
  name: 'Test Project',
  description: 'A test project',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  clientId: 'test-client-id',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Creates valid log sheet data for testing
 */
export const createValidLogSheetData = (): ILogSheetServiceData => ({
  date: '2024-01-15',
  notes: 'Test log sheet entry',
  chemicalUsageData: [
    { id: 'chemical-1', quantity: 10 },
    { id: 'chemical-2', quantity: 5 },
  ],
  'chiller-evaporator': {
    'temp-in': 15.5,
    'temp-out': 12.3,
  },
  general: {
    'ambient-temp': 22.0,
    observations: 'All systems operating normally',
  },
});

/**
 * Creates a mock log sheet response
 */
export const createMockLogSheet = () => ({
  id: 'test-log-sheet-id',
  projectId: 'test-project-id',
  date: new Date('2024-01-15'),
  notes: 'Test log sheet entry',
  clientPICSignatureId: 'test-signature-client-personnel-test-project-id',
  PICSignatureId: 'test-signature-personnel-test-project-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});
