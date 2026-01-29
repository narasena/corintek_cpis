/*
  Warnings:

  - Added the required column `unitNumber` to the `machines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."machines" ADD COLUMN     "unitNumber" INTEGER NOT NULL;
