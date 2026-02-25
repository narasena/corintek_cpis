import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifyLimitBreachesOnSubmission } from '../log-sheet-notifications';
import { notificationService } from '@/features/notifications/service';
import { buildLimitEvaluationInput } from '../limit-breach-adapter';

// Mock dependencies
vi.mock('@/features/notifications/service', () => ({
  notificationService: {
    evaluateLimitBreaches: vi.fn(),
  },
}));

vi.mock('../limit-breach-adapter', () => ({
  buildLimitEvaluationInput: vi.fn(),
}));

describe('notifyLimitBreachesOnSubmission', () => {
  const mockDetail: any = { id: 'logsheet-1' };
  const mockParams = {
    evaluatorUserId: 'user-1',
    technicianUserIds: ['user-2', 'user-3'],
    detail: mockDetail,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if no snapshots are generated', async () => {
    (buildLimitEvaluationInput as any).mockReturnValue([]);

    const result = await notifyLimitBreachesOnSubmission(mockParams);

    expect(result).toBeNull();
    expect(notificationService.evaluateLimitBreaches).not.toHaveBeenCalled();
  });

  it('should call evaluateLimitBreaches with correct recipients including evaluator', async () => {
    const mockSnapshots = [{ id: 'snap-1' }];
    (buildLimitEvaluationInput as any).mockReturnValue(mockSnapshots);
    (notificationService.evaluateLimitBreaches as any).mockResolvedValue({
      breaches: [],
    });

    await notifyLimitBreachesOnSubmission(mockParams);

    expect(notificationService.evaluateLimitBreaches).toHaveBeenCalledWith({
      evaluatorUserId: 'user-1',
      technicianUserIds: expect.arrayContaining(['user-1', 'user-2', 'user-3']),
      entries: mockSnapshots,
    });
  });

  it('should handle duplicate recipients', async () => {
    const paramsWithDupes = {
      ...mockParams,
      technicianUserIds: ['user-1', 'user-2'], // user-1 is also evaluator
    };
    const mockSnapshots = [{ id: 'snap-1' }];
    (buildLimitEvaluationInput as any).mockReturnValue(mockSnapshots);

    await notifyLimitBreachesOnSubmission(paramsWithDupes);

    const callArgs = (notificationService.evaluateLimitBreaches as any).mock
      .calls[0][0];
    const uniqueRecipients = new Set(callArgs.technicianUserIds);
    expect(uniqueRecipients.size).toBe(2); // user-1, user-2
    expect(uniqueRecipients.has('user-1')).toBe(true);
    expect(uniqueRecipients.has('user-2')).toBe(true);
  });

  it('should return null and log error if service fails', async () => {
    const mockSnapshots = [{ id: 'snap-1' }];
    (buildLimitEvaluationInput as any).mockReturnValue(mockSnapshots);
    (notificationService.evaluateLimitBreaches as any).mockRejectedValue(
      new Error('Service error')
    );

    // Spy on console.error to suppress output during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await notifyLimitBreachesOnSubmission(mockParams);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[CPIS-ERROR] LogSheets.Notifications:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
