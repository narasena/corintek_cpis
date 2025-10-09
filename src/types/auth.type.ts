import { authLoginSchema } from '@/app/login/schemas/loginSchema';
import z from 'zod';

export type TAuthLoginFormAttributes = z.infer<typeof authLoginSchema>;
