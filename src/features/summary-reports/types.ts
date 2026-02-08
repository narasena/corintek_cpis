import { SummaryReport, SummaryReportStatus } from '@prisma/client';

export type { SummaryReport, SummaryReportStatus };

export type CreateSummaryReportInput = {
  projectId: string;
  period: Date;
  notes?: string;
  includeExecutiveSummary?: boolean;
  includeLogSheets?: boolean;
  includeLabAnalysis?: boolean;
  includeWorkReports?: boolean;
  includeChemicalReports?: boolean;
};

export type UpdateSummaryReportInput = {
  id: string;
  dataTemuanUrl?: string;
  dataBlowdownUrl?: string;
  dataSuhuUrl?: string;
  dataSuratJalanUrl?: string;
  notes?: string;
  includeExecutiveSummary?: boolean;
  includeLogSheets?: boolean;
  includeLabAnalysis?: boolean;
  includeWorkReports?: boolean;
  includeChemicalReports?: boolean;
  status?: SummaryReportStatus;
};
