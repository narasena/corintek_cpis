import { z } from 'zod';
import { AuthenticationError } from './auth-helpers';
import { ensureAccess, TRbacResource, TRbacCapability } from './rbac';
import { TActionResult, err } from './action-helpers';

/**
 * Standard error messages required by the factory
 */
export interface IActionFactoryErrorConfig {
  sessionExpired: string;
  inputInvalid: string;
  genericError: string;
}

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
 * Generic factory that accepts an authenticator and error config.
 * Resolves layer inversion by allowing feature-layer wiring at composition root.
 */
export function createActionFactory<TActor extends { role: string }>(
  authenticate: () => Promise<TActor>,
  errorConfig: IActionFactoryErrorConfig
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
          return handleActionFailure(error, errorConfig);
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
function handleActionFailure(
  error: unknown,
  config: IActionFactoryErrorConfig
): TActionResult<never> {
  // 1. Authentication Errors
  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: config.sessionExpired,
    };
  }

  // 2. Validation Errors
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: formatZodError(error, config.inputInvalid),
    };
  }

  // 3. Fallback to generic error logging
  return err(error, config.genericError);
}

/**
 * Formats Zod errors into a flat, human-readable string
 */
function formatZodError(error: z.ZodError, fallback: string): string {
  if (error.issues.length === 0) return fallback;

  return error.issues
    .map(issue => {
      const path = issue.path.join('.');
      const message = issue.message;
      return path ? `${path}: ${message}` : message;
    })
    .join('; ');
}
