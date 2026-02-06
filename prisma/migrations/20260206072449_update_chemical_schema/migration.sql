/*
  Warnings:

  - You are about to drop the column `isActive` on the `chemicals` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChemicalCategory" AS ENUM ('BOILER_SYSTEM', 'COOLING_SYSTEM', 'CHEMICAL_CLEANING', 'WASTE_WATER_TREATMENT');

-- AlterTable
ALTER TABLE "chemicals" DROP COLUMN "isActive",
ADD COLUMN     "category" "ChemicalCategory" NOT NULL DEFAULT 'COOLING_SYSTEM',
ALTER COLUMN "unit" DROP NOT NULL;
