/*
  Warnings:

  - You are about to drop the column `IDNumber` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "IDNumber",
ADD COLUMN     "idNumber" TEXT,
ALTER COLUMN "isActive" SET DEFAULT true;
