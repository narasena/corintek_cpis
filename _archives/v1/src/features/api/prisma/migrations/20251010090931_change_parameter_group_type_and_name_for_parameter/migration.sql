/*
  Warnings:

  - You are about to drop the column `parameter` on the `parameters` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `parameters` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `parameters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `parameter_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `parameters` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ParameterGroupType" AS ENUM ('MACHINE', 'WATER', 'ENVIRONMENTAL', 'CHEMICAL', 'OPERATIONAL');

-- DropIndex
DROP INDEX "public"."parameters_parameter_key";

-- AlterTable
ALTER TABLE "public"."parameter_groups" ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" "public"."ParameterGroupType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."parameters" DROP COLUMN "parameter",
DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."ParameterType";

-- CreateIndex
CREATE UNIQUE INDEX "parameters_name_key" ON "public"."parameters"("name");
