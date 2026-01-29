-- CreateEnum
CREATE TYPE "public"."MachineOwnership" AS ENUM ('CORINTEK', 'CLIENT');

-- AlterTable
ALTER TABLE "public"."machines" ADD COLUMN     "ownership" "public"."MachineOwnership" NOT NULL DEFAULT 'CORINTEK';
