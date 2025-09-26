import { EmploymentStatus, UserRole } from "@/features/api/generated/prisma";
import z from "zod";

const userSchema = z.object({
  firstName: z.string("Hanya huruf").regex(/^[a-zA-Z]+$/, "Hanya huruf").nonempty("Wajib diisi").min(3, "Minimal 3 karakter"),
  lastName: z.string().regex(/^[a-zA-Z]+$/, "Hanya huruf").nullable().optional(),
  idNumber: z.string().nullable().optional(),
  email: z.email("Format email salah").nonempty("Wajib diisi"),
  password: z.string().nonempty("Wajib diisi").min(6, "Minimal 6 karakter"),
  phoneNumber: z.string("Hanya angka").regex(/^[0-9]+$/, "Hanya angka").min(10, "Minimal 10 angka").max(17, "Maksimal 17 angka"),
  role: z.enum(UserRole,"Pilih salah satu"),
  employmentStatus: z.enum(EmploymentStatus,"Pilih salah satu"),
  avatarUrl: z.url().nullable().optional(),
  avatarPublicId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional()
})

export default userSchema