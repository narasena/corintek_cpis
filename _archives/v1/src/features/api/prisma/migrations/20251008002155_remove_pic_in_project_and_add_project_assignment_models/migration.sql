/*
  Warnings:

  - You are about to drop the column `clientPICId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `internalPICId` on the `projects` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectAssignmentRole" AS ENUM ('INTERNAL', 'CLIENT');

-- DropForeignKey
ALTER TABLE "public"."projects" DROP CONSTRAINT "projects_clientPICId_fkey";

-- DropForeignKey
ALTER TABLE "public"."projects" DROP CONSTRAINT "projects_internalPICId_fkey";

-- DropIndex
DROP INDEX "public"."projects_clientPICId_idx";

-- DropIndex
DROP INDEX "public"."projects_internalPICId_idx";

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "clientPICId",
DROP COLUMN "internalPICId";

-- CreateTable
CREATE TABLE "public"."project_assignments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "role" "public"."ProjectAssignmentRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."project_assignments" ADD CONSTRAINT "project_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_assignments" ADD CONSTRAINT "project_assignments_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
