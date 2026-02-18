-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('UTAMA', 'ADDENDUM');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "parentProjId" TEXT,
ADD COLUMN     "projectType" "ProjectType" NOT NULL DEFAULT 'UTAMA';

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_parentProjId_fkey" FOREIGN KEY ("parentProjId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
