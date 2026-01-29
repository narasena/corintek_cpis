/*
  Warnings:

  - You are about to drop the column `technicianId` on the `projects` table. All the data in the column will be lost.
  - Added the required column `internalPICId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."projects" DROP CONSTRAINT "projects_technicianId_fkey";

-- DropIndex
DROP INDEX "public"."projects_technicianId_idx";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "technicianId",
ADD COLUMN     "internalPICId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "projects_internalPICId_idx" ON "projects"("internalPICId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_internalPICId_fkey" FOREIGN KEY ("internalPICId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
