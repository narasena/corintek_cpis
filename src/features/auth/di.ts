/**
 * @fileoverview DI Composition Root for Auth Feature
 * @module features/auth/di
 */

import { createActionFactory } from '@/lib/action-factory';
import { requireActor } from './lib/user-context';
import { ERROR_MESSAGES } from './constants';

/**
 * Global Server Action Factory
 * Standardized orchestrator for authentication, authorization, and validation.
 */
export const actionFactory = createActionFactory(requireActor, {
  sessionExpired: ERROR_MESSAGES.SESSION_EXPIRED,
  inputInvalid: ERROR_MESSAGES.INPUT_INVALID,
  genericError: ERROR_MESSAGES.GENERIC_ERROR,
});
