ALTER TABLE "summary_reports" ADD COLUMN "includeExecutiveSummary" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "summary_reports" ADD COLUMN "includeLogSheets" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "summary_reports" ADD COLUMN "includeLabAnalysis" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "summary_reports" ADD COLUMN "includeWorkReports" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "summary_reports" ADD COLUMN "includeChemicalReports" BOOLEAN NOT NULL DEFAULT true;
