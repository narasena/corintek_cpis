/*
  Warnings:

  - You are about to drop the column `detailType` on the `log_sheet_details` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `log_sheet_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."log_sheet_details" DROP COLUMN "detailType",
ADD COLUMN     "groupId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."LogSheetDetailType";

-- AddForeignKey
ALTER TABLE "public"."log_sheet_details" ADD CONSTRAINT "log_sheet_details_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."parameter_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
