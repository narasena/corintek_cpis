/*
  Warnings:

  - A unique constraint covering the columns `[variableName]` on the table `parameters` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."parameters" ADD COLUMN     "variableName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "parameters_variableName_key" ON "public"."parameters"("variableName");
