import { z } from 'zod';
import { ChemicalCategory } from '@/generated/prisma/enums';

export { ChemicalCategory };

export const ChemicalCategoryLabel: Record<ChemicalCategory, string> = {
  [ChemicalCategory.BOILER_SYSTEM]: 'Boiler System',
  [ChemicalCategory.COOLING_SYSTEM]: 'Cooling System',
  [ChemicalCategory.CHEMICAL_CLEANING]: 'Chemical Cleaning',
  [ChemicalCategory.WASTE_WATER_TREATMENT]: 'Waste & Water Treatment Plant',
};

export type TChemical = {
  id: string;
  name: string;
  unit: string | null;
  description: string | null;
  category: ChemicalCategory;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type TChemicalCreateInput = {
  name: string;
  unit?: string | null;
  description?: string | null;
  category: ChemicalCategory;
};

export type TChemicalUpdateInput = {
  id: string;
  name?: string;
  unit?: string | null;
  description?: string | null;
  category?: ChemicalCategory;
};

export type TChemicalUsage = {
  id: string;
  logSheetId: string;
  chemicalId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TChemicalUsageCreateInput = {
  logSheetId: string;
  chemicalId: string;
  amount: number;
  createdAt: Date;
};

export const chemicalCreateSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  unit: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.nativeEnum(ChemicalCategory, {
    message: 'Kategori wajib dipilih',
  }),
});

export const chemicalUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  unit: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.nativeEnum(ChemicalCategory).optional(),
});

export const chemicalUsageSchema = z.object({
  id: z.string().uuid().optional(),
  chemicalId: z.string().uuid('Chemical ID tidak valid'),
  amount: z.number().min(0, 'Jumlah harus lebih dari 0'),
});
