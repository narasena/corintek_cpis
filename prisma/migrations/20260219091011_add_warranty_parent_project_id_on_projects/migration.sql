-- CreateEnum
CREATE TYPE "ProjectContractType" AS ENUM ('DIRECT', 'SUBCONTRACT');

-- CreateEnum
CREATE TYPE "ProjectWorkCategory" AS ENUM ('OPERATIONAL', 'CONSTRUCTION', 'AD_HOC');

-- AlterTable
ALTER TABLE "lab_analyses" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "log_sheets" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "contractType" "ProjectContractType" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "warrantyMonths" INTEGER,
ADD COLUMN     "workCategory" "ProjectWorkCategory" NOT NULL DEFAULT 'OPERATIONAL';
