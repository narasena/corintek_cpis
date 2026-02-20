import { vi, describe, it, expect, beforeEach } from 'vitest';
import { resolveTargetProjectIds, type IProjectAccessServices } from './utils';

describe('resolveTargetProjectIds', () => {
  const mockActor = {
    id: 'uuid',
    email: 'test@test.com',
    role: 'SUPER_ADMIN' as any,
  };

  let mockServices: IProjectAccessServices;

  beforeEach(() => {
    mockServices = {
      assertCanAccessProject: vi.fn(),
      getAccessibleProjectIds: vi.fn(),
    };
  });

  it('Scenario 1: Returns SPECIFIC project ID when access is granted', async () => {
    vi.mocked(mockServices.assertCanAccessProject).mockResolvedValueOnce(
      undefined
    );

    const result = await resolveTargetProjectIds(
      mockActor,
      'proj-123',
      mockServices
    );

    expect(mockServices.assertCanAccessProject).toHaveBeenCalledWith(
      mockActor,
      'proj-123'
    );
    expect(result).toEqual(['proj-123']);
  });

  it('Scenario 2: Bubbles up ERROR if actor cannot access requested project', async () => {
    vi.mocked(mockServices.assertCanAccessProject).mockRejectedValueOnce(
      new Error('Forbidden')
    );

    await expect(
      resolveTargetProjectIds(mockActor, 'proj-123', mockServices)
    ).rejects.toThrow('Forbidden');
  });

  it('Scenario 3: Returns ALL accessible project IDs when no specific ID is requested', async () => {
    vi.mocked(mockServices.getAccessibleProjectIds).mockResolvedValueOnce([
      'proj-A',
      'proj-B',
    ]);

    const result = await resolveTargetProjectIds(
      mockActor,
      undefined,
      mockServices
    );

    expect(result).toEqual(['proj-A', 'proj-B']);
  });

  it('Scenario 4: Returns "empty" semantic state when actor has zero accessible projects', async () => {
    vi.mocked(mockServices.getAccessibleProjectIds).mockResolvedValueOnce([]);

    const result = await resolveTargetProjectIds(
      mockActor,
      undefined,
      mockServices
    );

    expect(result).toBe('empty');
  });

  it('Scenario 5: Returns undefined when getAccessibleProjectIds returns undefined (global access/no limit)', async () => {
    vi.mocked(mockServices.getAccessibleProjectIds).mockResolvedValueOnce(
      undefined
    );

    const result = await resolveTargetProjectIds(
      mockActor,
      undefined,
      mockServices
    );

    expect(result).toBeUndefined();
  });
});
