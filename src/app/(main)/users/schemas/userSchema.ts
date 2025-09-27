import { EmploymentStatus, UserRole } from "@/features/api/generated/prisma";
import z from "zod";

const passwordMismatchError = { message: "Password tidak sesuai", path: ['confirmPassword'] };

const minLengthErrorMessage = "Minimal 6 karakter";
const maxLengthErrorMessage = "Maksimal 20 karakter";
const uppercaseErrorMessage = "Minimal 1 huruf besar";
const lowercaseErrorMessage = "Minimal 1 huruf kecil";
const numberErrorMessage = "Minimal 1 angka";
const specialCharacterErrorMessage = "Minimal 1 karakter khusus";
const passwordSchema = z.string()
  .min(6, { message: minLengthErrorMessage })
  .max(20, { message: maxLengthErrorMessage })
  .refine((password) => /[A-Z]/.test(password), {
    message: uppercaseErrorMessage,
  })
  .refine((password) => /[a-z]/.test(password), {
    message: lowercaseErrorMessage,
  })
  .refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
  .refine((password) => /[!@#$%^&*+\-_=]/.test(password), {
    message: specialCharacterErrorMessage,
  });

const omittedRoles: readonly UserRole[] = [UserRole.CLIENT_PIC, UserRole.CLIENT_MANAGER];
const allowedRoles = Object.values(UserRole).filter(
  (role) => !omittedRoles.includes(role)
) as [UserRole, ...UserRole[]];
const filteredUserRole = z.enum(allowedRoles);

const nameRegex = /^[a-zA-Z .'\-]+$/;

export const userCreationSchema = z.object({
  firstName: z.string("Hanya huruf").regex(nameRegex, "Hanya huruf").nonempty("Wajib diisi").min(3, "Minimal 3 karakter"),
  lastName: z.string().regex(nameRegex, "Hanya huruf").nonempty("Wajib diisi"),
  idNumber: z.string().nullable().optional(),
  email: z.email("Format email salah").nonempty("Wajib diisi"),
  password: passwordSchema,
  confirmPassword: z.string(),
  phoneNumber: z.string("Hanya angka").regex(/^[0-9]+$/, "Hanya angka").min(10, "Minimal 10 angka").max(17, "Maksimal 17 angka"),
  role: filteredUserRole,
  employmentStatus: z.enum(EmploymentStatus,"Pilih salah satu"),
  avatarImg: z.file().nullable().optional(),
}).refine((data) => data.password === data.confirmPassword, passwordMismatchError);

export const userEditSchema = userCreationSchema.safeExtend({
  isActive: z.boolean().nullable().optional(),
  isBlocked: z.boolean().nullable().optional(),
}).refine((data) => {
  // if password is not present, confirm password should also not be present
  if (data.password === undefined) {
    return data.confirmPassword === undefined;
  }
  return data.password === data.confirmPassword;
}, passwordMismatchError);
