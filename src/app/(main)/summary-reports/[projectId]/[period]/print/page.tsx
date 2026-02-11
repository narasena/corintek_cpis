import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { PrintButton } from '@/components/print-button';
import { getProjectById } from '@/features/projects/service';
import {
  ensureSummaryReport,
  getMonthlyChemicalUsageSummary,
  getMonthlyLabAnalyses,
  getMonthlyLogSheets,
  getMonthlyWorkReports,
  getProjectLogSheetConfig,
} from '@/features/summary-reports/service';
import { LogSheetPreview } from '@/features/log-sheets/components/log-sheet-preview';
import { makeEntryKey } from '@/features/log-sheets/utils';
import type {
  TLogSheetEntryRole,
  TPreviewParameter,
} from '@/features/log-sheets/types';
import { WorkReportPreview } from '@/features/work-reports/components/work-report-preview';
import { WorkReportPhotoType } from '@/generated/prisma/enums';
import { LabAnalysisPrint } from '@/features/lab-analyses/components/lab-analysis-print';

interface PageProps {
  params: Promise<{ projectId: string; period: string }>;
}

function parsePeriod(period: string) {
  const [yearStr, monthStr] = period.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month || month < 1 || month > 12) return null;
  // Use UTC to avoid timezone shifts when calculating ranges in service
  return new Date(Date.UTC(year, month - 1, 1));
}

export default async function SummaryReportPrintPage({ params }: PageProps) {
  const { projectId, period } = await params;
  const periodDate = parsePeriod(period);
  if (!periodDate) return notFound();

  const [
    project,
    summaryReport,
    logSheets,
    labAnalyses,
    workReports,
    logSheetConfig,
  ] = await Promise.all([
    getProjectById(projectId),
    ensureSummaryReport(projectId, periodDate),
    getMonthlyLogSheets(projectId, periodDate),
    getMonthlyLabAnalyses(projectId, periodDate),
    getMonthlyWorkReports(projectId, periodDate),
    getProjectLogSheetConfig(projectId),
  ]);

  if (!project || !summaryReport) return notFound();

  const chemicalSummary = await getMonthlyChemicalUsageSummary(
    projectId,
    periodDate
  );

  const periodLabel = format(periodDate, 'MMMM yyyy', { locale: idLocale });
  const tocItems = [
    summaryReport.includeExecutiveSummary
      ? 'Bab I — Executive Summary Report'
      : null,
    summaryReport.includeLogSheets ? 'Bab II — Log Sheet Reports' : null,
    summaryReport.includeLabAnalysis ? 'Bab III — Analisa Laboratorium' : null,
    summaryReport.includeWorkReports ? 'Bab IV — Work Reports' : null,
    summaryReport.includeChemicalReports ? 'Bab V — Chemical Reports' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" asChild>
          <Link href="/summary-reports">Kembali</Link>
        </Button>
        <PrintButton />
      </div>

      <div className="bg-white text-black text-sm leading-tight w-[210mm] mx-auto shadow-xl print:shadow-none print:w-full print:mx-0">
        <div className="min-h-[297mm] p-8 print:p-0 flex flex-col items-center justify-center text-center">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Summary Report
            </div>
            <h1 className="text-3xl font-bold uppercase">
              Laporan Ringkas Bulanan
            </h1>
            <div className="text-lg font-semibold">{project.name}</div>
            <div className="text-sm text-gray-600">
              {project.client?.name ?? '-'}
            </div>
            <div className="text-base">{periodLabel}</div>
          </div>
        </div>

        <div className="break-before-page min-h-[297mm] p-8 print:p-0">
          <h2 className="text-xl font-bold mb-4 uppercase">Table of Content</h2>
          <ol className="list-decimal pl-6 space-y-2">
            {tocItems.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        {summaryReport.includeExecutiveSummary && (
          <div className="break-before-page min-h-[297mm] p-8 print:p-0">
            <h2 className="text-xl font-bold uppercase mb-4">
              Bab I — Executive Summary Report
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-3">
                <div className="text-xs uppercase text-gray-500">
                  Total Log Sheet
                </div>
                <div className="text-2xl font-semibold">{logSheets.length}</div>
              </div>
              <div className="border p-3">
                <div className="text-xs uppercase text-gray-500">
                  Total Lab Analisa
                </div>
                <div className="text-2xl font-semibold">
                  {labAnalyses.length}
                </div>
              </div>
              <div className="border p-3">
                <div className="text-xs uppercase text-gray-500">
                  Total Work Report
                </div>
                <div className="text-2xl font-semibold">
                  {workReports.length}
                </div>
              </div>
              <div className="border p-3">
                <div className="text-xs uppercase text-gray-500">
                  Total Chemical Usage
                </div>
                <div className="text-2xl font-semibold">
                  {chemicalSummary.length}
                </div>
              </div>
            </div>

            {summaryReport.notes && (
              <div className="mt-6 border p-4">
                <div className="text-xs uppercase text-gray-500 mb-2">
                  Catatan
                </div>
                <div className="text-sm">{summaryReport.notes}</div>
              </div>
            )}
          </div>
        )}

        {summaryReport.includeLogSheets && (
          <>
            <div className="break-before-page min-h-[297mm] p-8 print:p-0 flex flex-col justify-center text-center">
              <h2 className="text-3xl font-bold uppercase mb-4">
                Bab II — Log Sheet Reports
              </h2>
              {logSheets.length === 0 && (
                <div className="text-sm text-gray-500">
                  Tidak ada log sheet pada periode ini.
                </div>
              )}
            </div>

            {logSheets.map(ls => {
              const valuesByKey: Record<string, TEntryState> = {};
              ls.entries.forEach(entry => {
                const key = makeEntryKey(
                  entry.parameterId,
                  entry.machineId,
                  entry.role as TLogSheetEntryRole
                );
                valuesByKey[key] = {
                  valueType: entry.parameter.valueType,
                  numericValue: entry.numericValue,
                  boolValue: entry.boolValue,
                  textValue: entry.textValue,
                  fileUrl: entry.fileUrl,
                };
              });

              return (
                <div
                  key={ls.id}
                  className="break-before-page min-h-[297mm] print:p-0"
                >
                  <LogSheetPreview
                    customerName={project.client?.name ?? '-'}
                    date={ls.date}
                    byName="Operator" // This should probably be fetched or hardcoded if unknown
                    replacedByName={
                      ls.replacedBy
                        ? `${ls.replacedBy.firstName} ${ls.replacedBy.lastName}`
                        : null
                    }
                    notes={ls.notes}
                    machines={logSheetConfig.machines}
                    parameters={
                      logSheetConfig.parameters as TPreviewParameter[]
                    }
                    valuesByKey={valuesByKey}
                    photos={ls.photos.map(p => ({
                      id: p.id,
                      type: p.type as 'BEFORE' | 'AFTER',
                      url: p.url,
                      caption: p.caption,
                    }))}
                    chemicalUsages={ls.chemicalUsages.map(u => ({
                      chemicalName: u.chemical.name,
                      amount: u.amount ?? 0,
                      unit: u.chemical.unit ?? '',
                    }))}
                  />
                </div>
              );
            })}
          </>
        )}

        {summaryReport.includeLabAnalysis && (
          <>
            <div className="break-before-page min-h-[297mm] p-8 print:p-0 flex flex-col justify-center text-center">
              <h2 className="text-3xl font-bold uppercase mb-4">
                Bab III — Analisa Laboratorium
              </h2>
              {labAnalyses.length === 0 && (
                <div className="text-sm text-gray-500">
                  Tidak ada analisa laboratorium pada periode ini.
                </div>
              )}
            </div>

            {labAnalyses.map(la => (
              <div
                key={la.id}
                className="break-before-page min-h-[297mm] print:p-0"
              >
                <LabAnalysisPrint
                  labAnalysis={la}
                  parameters={logSheetConfig.labParameters}
                />
              </div>
            ))}
          </>
        )}

        {summaryReport.includeWorkReports && (
          <>
            <div className="break-before-page min-h-[297mm] p-8 print:p-0 flex flex-col justify-center text-center">
              <h2 className="text-3xl font-bold uppercase mb-4">
                Bab IV — Work Reports
              </h2>
              {workReports.length === 0 && (
                <div className="text-sm text-gray-500">
                  Tidak ada work report pada periode ini.
                </div>
              )}
            </div>

            {workReports.map(wr => (
              <div
                key={wr.id}
                className="break-before-page min-h-[297mm] print:p-0"
              >
                <WorkReportPreview
                  data={{
                    project,
                    date: wr.date,
                    situation: wr.situation,
                    workDone: wr.workDone,
                    workResult: wr.workResult,
                    machines: wr.machines.map(m => ({
                      type: m.type,
                      unitNumber: m.unitNumber,
                      brand: m.brand,
                    })),
                    photos: wr.photos.map(p => ({
                      url: p.url,
                      caption: p.caption,
                      type: p.type as WorkReportPhotoType,
                    })),
                  }}
                />
              </div>
            ))}
          </>
        )}

        {summaryReport.includeChemicalReports && (
          <div className="break-before-page min-h-[297mm] p-8 print:p-0">
            <h2 className="text-xl font-bold uppercase mb-4">
              Bab V — Chemical Reports
            </h2>
            {chemicalSummary.length === 0 ? (
              <div className="text-sm text-gray-500">
                Tidak ada pemakaian chemical pada periode ini.
              </div>
            ) : (
              <div className="space-y-2">
                {chemicalSummary.map(item => (
                  <div
                    key={item.chemicalId}
                    className="border p-3 flex items-center justify-between"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm">
                      {item.total} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
