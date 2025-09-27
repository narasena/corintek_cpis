import { EmploymentStatus, UserRole } from "@/features/api/generated/prisma";
import z from "zod";
import { is } from "zod/v4/locales";

export const userCreationSchema = z.object({
  firstName: z.string("Hanya huruf").regex(/^[a-zA-Z]+$/, "Hanya huruf").nonempty("Wajib diisi").min(3, "Minimal 3 karakter"),
  lastName: z.string().regex(/^[a-zA-Z]+$/, "Hanya huruf").nonempty("Wajib diisi"),
  idNumber: z.string().nullable().optional(),
  email: z.email("Format email salah").nonempty("Wajib diisi"),
  password: z.string().nonempty("Wajib diisi").min(6, "Minimal 6 karakter"),
  phoneNumber: z.string("Hanya angka").regex(/^[0-9]+$/, "Hanya angka").min(10, "Minimal 10 angka").max(17, "Maksimal 17 angka"),
  role: z.enum(UserRole,"Pilih salah satu"),
  employmentStatus: z.enum(EmploymentStatus,"Pilih salah satu"),
  avatarImg: z.file().nullable().optional(),
})

export const userEditSchema = userCreationSchema.extend({
  isActive: z.boolean().nullable().optional(),
  isBlocked: z.boolean().nullable().optional(),
})
