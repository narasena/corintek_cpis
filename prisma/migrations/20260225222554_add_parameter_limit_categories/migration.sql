-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "parameterLimitCategoryId" TEXT;

-- CreateTable
CREATE TABLE "parameter_limit_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parameter_limit_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameter_limits" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "rawWaterMinValue" DOUBLE PRECISION,
    "rawWaterMaxValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parameter_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parameter_limit_categories_name_key" ON "parameter_limit_categories"("name");

-- CreateIndex
CREATE INDEX "parameter_limits_categoryId_idx" ON "parameter_limits"("categoryId");

-- CreateIndex
CREATE INDEX "parameter_limits_parameterId_idx" ON "parameter_limits"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_limits_categoryId_parameterId_key" ON "parameter_limits"("categoryId", "parameterId");

-- CreateIndex
CREATE INDEX "projects_parameterLimitCategoryId_idx" ON "projects"("parameterLimitCategoryId");

-- AddForeignKey
ALTER TABLE "parameter_limits" ADD CONSTRAINT "parameter_limits_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "parameter_limit_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parameter_limits" ADD CONSTRAINT "parameter_limits_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_parameterLimitCategoryId_fkey" FOREIGN KEY ("parameterLimitCategoryId") REFERENCES "parameter_limit_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
