-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ParameterGroupType" ADD VALUE 'LOG_SHEET';
ALTER TYPE "public"."ParameterGroupType" ADD VALUE 'WORK_REPORT';
ALTER TYPE "public"."ParameterGroupType" ADD VALUE 'LAB_REPORT';
