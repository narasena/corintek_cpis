import {
  EmploymentStatus,
  UserRole,
} from '@/features/api/generated/prisma/enums';
import { defaultSchemaMessage } from '@/features/schemas/defaultSchema';
import z from 'zod';

const passwordMismatchError = {
  message: defaultSchemaMessage.passwordMismatch,
  path: ['confirmPassword'],
};
const passwordSchema = z
  .string()
  .min(6, defaultSchemaMessage.min(6))
  .max(20, defaultSchemaMessage.max(20))
  .refine(
    password => /[A-Z]/.test(password),
    defaultSchemaMessage.at_least_one.uppercase
  )
  .refine(
    password => /[a-z]/.test(password),
    defaultSchemaMessage.at_least_one.lowercase
  )
  .refine(
    password => /[0-9]/.test(password),
    defaultSchemaMessage.at_least_one.number
  )
  .refine(
    password => /[!@#$%^&*+\-_=]/.test(password),
    defaultSchemaMessage.at_least_one.special_character
  );

const clientOmittedRoles: readonly UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPERVISOR,
  UserRole.TECHNICIAN,
  UserRole.DIRECTOR,
];
const clientAllowedRoles = Object.values(UserRole).filter(
  role => !clientOmittedRoles.includes(role)
) as [UserRole, ...UserRole[]];

const filteredClientRole = z.enum(
  clientAllowedRoles,
  defaultSchemaMessage.choose_one
);

const nameRegex = /^[a-zA-Z .'\-]+$/;

export const clientPersonnelCreateSchema = z
  .object({
    firstName: z
      .string(defaultSchemaMessage.only.alphabet)
      .regex(nameRegex, defaultSchemaMessage.only.alphabet)
      .nonempty(defaultSchemaMessage.nonempty)
      .min(3, defaultSchemaMessage.min(3)),
    lastName: z
      .string()
      .regex(nameRegex, defaultSchemaMessage.only.alphabet)
      .nonempty(defaultSchemaMessage.nonempty)
      .nullable()
      .optional(),
    idNumber: z.string().nullable().optional(),
    email: z
      .email(defaultSchemaMessage.email)
      .nonempty(defaultSchemaMessage.nonempty),
    password: passwordSchema,
    confirmPassword: z.string(),
    phoneNumber: z
      .string(defaultSchemaMessage.only.number)
      .regex(/^[0-9]+$/, defaultSchemaMessage.only.number)
      .min(10, defaultSchemaMessage.min(10))
      .max(17, defaultSchemaMessage.max(17)),
    role: filteredClientRole,
    employmentStatus: z.enum(EmploymentStatus, defaultSchemaMessage.choose_one),
    avatarImg: z.file().nullable().optional(),
  })
  .refine(
    data => data.password === data.confirmPassword,
    passwordMismatchError
  );

export const clientPersonnelEditSchema = clientPersonnelCreateSchema
  .safeExtend({
    isActive: z.boolean().nullable().optional(),
    isBlocked: z.boolean().nullable().optional(),
  })
  .refine(data => {
    // if password is not present, confirm password should also not be present
    if (data.password === undefined) {
      return data.confirmPassword === undefined;
    }
    return data.password === data.confirmPassword;
  }, passwordMismatchError);
