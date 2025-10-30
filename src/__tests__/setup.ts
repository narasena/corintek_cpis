import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ...data,
    })),
  },
}));

// Mock Prisma client
vi.mock('@/features/api/connection/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    logSheet: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    logSheetHistory: {
      create: vi.fn(),
    },
    logSheetDetail: {
      createMany: vi.fn(),
    },
    machine: {
      findMany: vi.fn(),
    },
    parameterGroup: {
      findMany: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock project service
vi.mock('@/features/api/features/v1/projects/project.service', () => ({
  fetchProjectByIdService: vi.fn(),
}));

// Mock error handlers
vi.mock('@/lib/error-handler', () => ({
  createErrorResponse: vi.fn(error => ({
    json: () => Promise.resolve({ success: false, message: error.message }),
    status: 500,
  })),
  serviceErrorResponse: vi.fn(options => ({
    success: false,
    message: options.customErrorMessage || 'Service error',
    status: options.status || 500,
  })),
}));

// Mock request validation
vi.mock('@/utils/api/v1/validation/requestValidation', () => ({
  default: vi.fn(),
}));
