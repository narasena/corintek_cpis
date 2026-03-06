import { z } from 'zod/v4';
import { AuthenticationError } from './auth-helpers';
import { ensureAccess, TRbacResource, TRbacCapability } from './rbac';
import { requireActor } from '@/features/auth/lib/user-context';

import { TActionResult, err, unauthorized } from './action-helpers';

/**
 * Metadata for a protected action
 */
export interface IActionMetadata {
  rbac?: {
    resource: TRbacResource;
    capability: TRbacCapability;
  };
}

export interface IActionOptions<TInput> {
  schema?: z.ZodType<TInput>;
  metadata?: IActionMetadata;
}

/**
 * Type-safe Server Action Factory (Infrastructure Layer)
 *
 * Generic factory that accepts an authenticator to resolve the actor.
 * Resolves layer inversion by injecting the high-level auth logic.
 */
export function createActionFactory<TActor extends { role: string }>(
  authenticate: () => Promise<TActor>
) {
  return {
    /**
     * Create a protected action that requires a valid session
     */
    protected: <TInput, TOutput>(
      handler: (params: { input: TInput; actor: TActor }) => Promise<TOutput>,
      options?: IActionOptions<TInput>
    ) => {
      return async (data: TInput): Promise<TActionResult<TOutput>> => {
        try {
          // 1. Authenticate (using injected logic)
          const actor = await authenticate();

          // 2. Authorize (RBAC)
          authorize(actor.role, options?.metadata);

          // 3. Validate Input
          const validatedInput = validate(data, options?.schema);

          // 4. Execute Handler
          const result = await handler({ input: validatedInput, actor });
          return { success: true, data: result };
        } catch (error: any) {
          return handleActionFailure(error);
        }
      };
    },
  };
}

/**
 * Authorizes the actor based on metadata
 */
function authorize(role: string, metadata?: IActionMetadata) {
  if (metadata?.rbac) {
    ensureAccess(role, metadata.rbac.resource, metadata.rbac.capability);
  }
}

/**
 * Validates the input data against the schema
 */
function validate<T>(data: T, schema?: z.ZodType<T>): T {
  if (!schema) return data;

  // Handle optional input for object schemas by providing empty object if data is missing
  const isObjectSchema = (schema as any)._def?.typeName === 'ZodObject';
  const inputToValidate =
    (data === null || data === undefined) && isObjectSchema
      ? ({} as T)
      : data;

  return schema.parse(inputToValidate);
}

/**
 * Centralized error handling for server actions
 */
function handleActionFailure(error: any): TActionResult<any> {
  if (error instanceof AuthenticationError || error.name === 'AuthenticationError') {
    return unauthorized();
  }

  // Handle ZodError more robustly by checking typeName or instanceof
  if (error instanceof z.ZodError || error.name === 'ZodError') {
    return {
      success: false,
      error: error.errors?.[0]?.message || error.message || 'Input tidak valid',
    };
  }

  // Centralized error logging via existing helper
  return err(error, 'Gagal');
}

/**
 * Singleton instance for the application
 * Uses the high-level Auth Feature's requireActor as the default authenticator.
 */
export const actionFactory = createActionFactory(requireActor);
