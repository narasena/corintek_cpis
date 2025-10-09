import { defaultSchemaMessage } from '@/features/schemas/defaultSchema';
import z from 'zod';

export const authLoginSchema = z.object({
  email: z
    .email(defaultSchemaMessage.email)
    .nonempty(defaultSchemaMessage.nonempty),
  password: z.string().nonempty(defaultSchemaMessage.nonempty),
});
