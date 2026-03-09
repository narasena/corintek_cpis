/**
 * @fileoverview Unit tests for DI Container
 * @module lib/di/container.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { container } from './container';
import { DI_TOKENS } from './tokens';

describe('DIContainer', () => {
  beforeEach(() => {
    // Clear container before each test
    // Note: In real implementation, we'd need a clear method
  });

  it('should register and resolve transient service', () => {
    const mockService = { getData: () => 'data' };
    container.register(DI_TOKENS.PRISMA, () => mockService);

    const resolved = container.resolve(DI_TOKENS.PRISMA);
    expect(resolved).toBe(mockService);
  });

  it('should create new instance for transient service', () => {
    let counter = 0;
    const transientToken = Symbol('transient');
    container.register(transientToken, () => ({ id: ++counter }));

    const first = container.resolve<{ id: number }>(transientToken);
    const second = container.resolve<{ id: number }>(transientToken);

    expect(first.id).toBe(1);
    expect(second.id).toBe(2); // New instance each time
  });

  it('should return same instance for singleton', () => {
    let counter = 0;
    const singletonToken = Symbol('singleton');
    container.registerSingleton(singletonToken, () => ({ id: ++counter }));

    const first = container.resolve<{ id: number }>(singletonToken);
    const second = container.resolve<{ id: number }>(singletonToken);

    expect(first.id).toBe(1);
    expect(second.id).toBe(1); // Same instance
    expect(first).toBe(second);
  });

  it('should return registered instance directly', () => {
    const mockInstance = { name: 'test' };
    container.registerInstance(DI_TOKENS.PRISMA, mockInstance);

    const resolved = container.resolve(DI_TOKENS.PRISMA);
    expect(resolved).toBe(mockInstance);
  });

  it('should throw error for unregistered token', () => {
    const unregisteredToken = Symbol('unregistered');
    expect(() => container.resolve(unregisteredToken)).toThrow(
      'Service not registered'
    );
  });

  it('should check if token is registered', () => {
    const newToken = Symbol('new');
    expect(container.isRegistered(newToken)).toBe(false);

    container.registerInstance(newToken, {});
    expect(container.isRegistered(newToken)).toBe(true);
  });
});

describe('Service Factories', () => {
  it('should create AttendanceService with prisma dependency', async () => {
    const { createAttendanceService } = await import(
      '@/features/attendance/di'
    );
    const service = createAttendanceService();

    expect(service).toBeDefined();
    expect(service.listAttendance).toBeInstanceOf(Function);
    expect(service.countAttendance).toBeInstanceOf(Function);
  });

  it('should create LogSheetService with prisma dependency', async () => {
    const { createLogSheetService } = await import(
      '@/features/log-sheets/di'
    );
    const service = createLogSheetService();

    expect(service).toBeDefined();
    expect(service.getLogSheetsByProject).toBeInstanceOf(Function);
    expect(service.getAllLogSheets).toBeInstanceOf(Function);
  });

  it('should create WorkReportService with prisma dependency', async () => {
    const { createWorkReportService } = await import(
      '@/features/work-reports/di'
    );
    const service = createWorkReportService();

    expect(service).toBeDefined();
    expect(service.getWorkReportsByProject).toBeInstanceOf(Function);
  });
});
