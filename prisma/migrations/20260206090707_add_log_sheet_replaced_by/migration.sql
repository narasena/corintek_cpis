-- AlterTable
ALTER TABLE "log_sheets" ADD COLUMN     "replacedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "log_sheets" ADD CONSTRAINT "log_sheets_replacedByUserId_fkey" FOREIGN KEY ("replacedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
