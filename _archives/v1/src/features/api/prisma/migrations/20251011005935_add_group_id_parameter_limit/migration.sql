/*
  Warnings:

  - You are about to drop the column `groupId` on the `parameters` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `parameter_limits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."parameters" DROP CONSTRAINT "parameters_groupId_fkey";

-- DropIndex
DROP INDEX "public"."parameters_groupId_idx";

-- AlterTable
ALTER TABLE "public"."parameter_limits" ADD COLUMN     "groupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."parameters" DROP COLUMN "groupId";

-- CreateTable
CREATE TABLE "public"."parameter_group_members" (
    "id" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parameter_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parameter_group_members_parameterId_idx" ON "public"."parameter_group_members"("parameterId");

-- CreateIndex
CREATE INDEX "parameter_group_members_groupId_idx" ON "public"."parameter_group_members"("groupId");

-- AddForeignKey
ALTER TABLE "public"."parameter_group_members" ADD CONSTRAINT "parameter_group_members_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameter_group_members" ADD CONSTRAINT "parameter_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."parameter_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameter_limits" ADD CONSTRAINT "parameter_limits_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."parameter_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
