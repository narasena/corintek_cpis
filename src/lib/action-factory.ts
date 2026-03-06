import { z } from 'zod/v4';
import { requireActor } from '@/features/auth/lib/user-context';
import { AuthenticationError } from './auth-helpers';
import { ensureAccess, TRbacResource, TRbacCapability } from './rbac';

import { ActionResult, err, unauthorized } from './action-helpers';

/**
 * Metadata for a protected action
 */
interface IActionMetadata {
  rbac?: {
    resource: TRbacResource;
    capability: TRbacCapability;
  };
}

interface IActionOptions<TInput> {
  schema?: z.ZodType<TInput>;
  metadata?: IActionMetadata;
}

/**
 * Type-safe Server Action Factory
 * 
 * Centralizes:
 * 1. Authentication (Actor resolution)
 * 2. Authorization (RBAC)
 * 3. Validation (Zod)
 * 4. Error handling & Logging
 */
export function createActionFactory() {
  return {
    /**
     * Create a protected action that requires a valid session
     */
    protected: <TInput, TOutput>(
      handler: (params: { input: TInput; actor: any }) => Promise<TOutput>,
      options?: IActionOptions<TInput>
    ) => {
      return async (data: TInput): Promise<ActionResult<TOutput>> => {
        try {
          // 1. Authenticate
          const actor = await requireActor();

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
  // Using direct check for ZodObject to avoid instanceof issues with different versions
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
function handleActionFailure(error: any): ActionResult<any> {
  if (error instanceof AuthenticationError) {
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

export const actionFactory = createActionFactory();
