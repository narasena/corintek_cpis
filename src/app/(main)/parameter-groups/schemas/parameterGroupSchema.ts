import { z } from 'zod';
import { defaultSchemaMessage } from '@/features/schemas/defaultSchema';

export const parameterGroupCreationSchema = z.object({
  name: z
    .string({ required_error: defaultSchemaMessage.nonempty })
    .min(1, { message: defaultSchemaMessage.nonempty }),
  description: z.string().optional(),
  // Add other fields validation as needed
});
