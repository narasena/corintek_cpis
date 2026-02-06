-- CreateTable
CREATE TABLE "project_parameter_overrides" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "rawWaterMinValue" DOUBLE PRECISION,
    "rawWaterMaxValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_parameter_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_parameter_overrides_projectId_parameterId_key" ON "project_parameter_overrides"("projectId", "parameterId");

-- AddForeignKey
ALTER TABLE "project_parameter_overrides" ADD CONSTRAINT "project_parameter_overrides_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_parameter_overrides" ADD CONSTRAINT "project_parameter_overrides_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
