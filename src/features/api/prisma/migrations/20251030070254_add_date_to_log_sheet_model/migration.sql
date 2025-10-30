/*
  Warnings:

  - Added the required column `date` to the `log_sheets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."log_sheets" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
