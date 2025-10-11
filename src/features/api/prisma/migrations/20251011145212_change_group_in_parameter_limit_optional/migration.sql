-- DropForeignKey
ALTER TABLE "public"."parameter_limits" DROP CONSTRAINT "parameter_limits_groupId_fkey";

-- AlterTable
ALTER TABLE "public"."parameter_limits" ALTER COLUMN "groupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."parameter_limits" ADD CONSTRAINT "parameter_limits_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."parameter_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
