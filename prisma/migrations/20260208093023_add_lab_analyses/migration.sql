-- CreateEnum
CREATE TYPE "LabAnalysisColumnKind" AS ENUM ('RAW_WATER', 'CTW', 'CHW', 'OTHER');

-- CreateTable
CREATE TABLE "lab_analyses" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "attention" TEXT,
    "cc" TEXT,
    "customer" TEXT,
    "address" TEXT,
    "faxNumber" TEXT,
    "reportNumber" TEXT,
    "remarks" TEXT,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lab_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_analysis_columns" (
    "id" TEXT NOT NULL,
    "labAnalysisId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "LabAnalysisColumnKind" NOT NULL DEFAULT 'OTHER',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lab_analysis_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_analysis_entries" (
    "id" TEXT NOT NULL,
    "labAnalysisId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "valueType" "ValueType" NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "boolValue" BOOLEAN,
    "textValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lab_analysis_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lab_analyses_projectId_date_idx" ON "lab_analyses"("projectId", "date");

-- CreateIndex
CREATE INDEX "lab_analysis_columns_labAnalysisId_idx" ON "lab_analysis_columns"("labAnalysisId");

-- CreateIndex
CREATE INDEX "lab_analysis_columns_kind_idx" ON "lab_analysis_columns"("kind");

-- CreateIndex
CREATE INDEX "lab_analysis_entries_labAnalysisId_idx" ON "lab_analysis_entries"("labAnalysisId");

-- CreateIndex
CREATE INDEX "lab_analysis_entries_parameterId_idx" ON "lab_analysis_entries"("parameterId");

-- CreateIndex
CREATE INDEX "lab_analysis_entries_columnId_idx" ON "lab_analysis_entries"("columnId");

-- CreateIndex
CREATE UNIQUE INDEX "lab_analysis_entries_labAnalysisId_parameterId_columnId_key" ON "lab_analysis_entries"("labAnalysisId", "parameterId", "columnId");

-- AddForeignKey
ALTER TABLE "lab_analyses" ADD CONSTRAINT "lab_analyses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_analysis_columns" ADD CONSTRAINT "lab_analysis_columns_labAnalysisId_fkey" FOREIGN KEY ("labAnalysisId") REFERENCES "lab_analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_analysis_entries" ADD CONSTRAINT "lab_analysis_entries_labAnalysisId_fkey" FOREIGN KEY ("labAnalysisId") REFERENCES "lab_analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_analysis_entries" ADD CONSTRAINT "lab_analysis_entries_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_analysis_entries" ADD CONSTRAINT "lab_analysis_entries_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "lab_analysis_columns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
