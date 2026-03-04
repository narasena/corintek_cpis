/**
 * Dashboard Activity Error Classes
 * @module features/dashboard/errors
 */

import type { TActivityErrorCode, IActivityError } from './types';

/**
 * Domain error for activity-related failures
 */
export class ActivityError extends Error implements IActivityError {
  readonly code: TActivityErrorCode;
  readonly userId?: string;
  readonly projectId?: string;
  readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    code: TActivityErrorCode;
    userId?: string;
    projectId?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'ActivityError';
    this.code = params.code;
    this.userId = params.userId;
    this.projectId = params.projectId;
    this.details = params.details;
  }
}

/**
 * Factory function for creating activity errors
 */
export function createActivityError(params: {
  message: string;
  code: TActivityErrorCode;
  userId?: string;
  projectId?: string;
  details?: Record<string, unknown>;
}): IActivityError {
  // TODO: Implement error creation with proper stack trace preservation
  throw new Error('Not implemented');
}
