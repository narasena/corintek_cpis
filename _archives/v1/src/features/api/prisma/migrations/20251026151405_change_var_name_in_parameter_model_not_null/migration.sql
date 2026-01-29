/*
  Warnings:

  - Made the column `variableName` on table `parameters` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."parameters" ALTER COLUMN "variableName" SET NOT NULL;
