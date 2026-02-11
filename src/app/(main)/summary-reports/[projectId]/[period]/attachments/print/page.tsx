import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { PrintButton } from '@/components/print-button';
import { getProjectById } from '@/features/projects/service';
import { ensureSummaryReport } from '@/features/summary-reports/service';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';

interface PageProps {
  params: Promise<{ projectId: string; period: string }>;
}

function parsePeriod(period: string) {
  const [yearStr, monthStr] = period.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month || month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, 1));
}

function isPdfUrl(url: string) {
  return url.toLowerCase().endsWith('.pdf');
}

function isImageUrl(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif')
  );
}

function getPdfEmbedUrl(url: string) {
  const separator = url.includes('#') ? '&' : '#';
  return `${url}${separator}toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

export default async function SummaryReportAttachmentsPrintPage({
  params,
}: PageProps) {
  const actor = await getCurrentUser();
  if (!actor) return notFound();
  ensureAccess(actor.role, RbacResource.SUMMARY_REPORTS, 'read');

  const { projectId, period } = await params;
  const periodDate = parsePeriod(period);
  if (!periodDate) return notFound();

  const [project, summaryReport] = await Promise.all([
    getProjectById(projectId),
    ensureSummaryReport(actor, projectId, periodDate),
  ]);

  if (!project || !summaryReport) return notFound();

  const periodLabel = format(periodDate, 'MMMM yyyy', { locale: idLocale });
  const attachments = [
    { label: 'Data Temuan', url: summaryReport.dataTemuanUrl },
    { label: 'Data Blowdown Silang', url: summaryReport.dataBlowdownUrl },
    { label: 'Data Suhu', url: summaryReport.dataSuhuUrl },
    { label: 'Data Surat Jalan', url: summaryReport.dataSuratJalanUrl },
  ];
  const hasAnyAttachment = attachments.some(a => !!a.url);

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" asChild>
          <Link href={`/summary-reports/${projectId}/${period}/print`}>
            Kembali
          </Link>
        </Button>
        <PrintButton />
      </div>

      <div className="bg-white text-black text-sm leading-tight w-[210mm] mx-auto shadow-xl print:shadow-none print:w-full print:mx-0">
        <div className="min-h-[297mm] p-8 print:p-0 flex flex-col items-center justify-center text-center">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Attachment Pack
            </div>
            <h1 className="text-3xl font-bold uppercase">Lampiran Klien</h1>
            <div className="text-lg font-semibold">{project.name}</div>
            <div className="text-sm text-gray-600">
              {project.client?.name ?? '-'}
            </div>
            <div className="text-base">{periodLabel}</div>
          </div>
        </div>

        <div className="break-before-page min-h-[297mm] p-8 print:p-0">
          <h2 className="text-xl font-bold mb-4 uppercase">Daftar Lampiran</h2>
          <ol className="list-decimal pl-6 space-y-2">
            {attachments.map(item => (
              <li key={item.label}>
                {item.label}{' '}
                <span className="text-xs text-gray-500">
                  {item.url ? 'Tersedia' : 'Tidak ada'}
                </span>
              </li>
            ))}
          </ol>
          {!hasAnyAttachment && (
            <div className="text-sm text-gray-500 mt-6">
              Tidak ada lampiran pada periode ini.
            </div>
          )}
        </div>

        {attachments.map(item => {
          if (!item.url) return null;
          if (isImageUrl(item.url)) {
            return (
              <div
                key={item.label}
                className="break-before-page min-h-[297mm] p-8 print:p-0"
              >
                <h2 className="text-lg font-semibold mb-4">{item.label}</h2>
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-auto"
                />
              </div>
            );
          }

          if (isPdfUrl(item.url)) {
            const embedUrl = getPdfEmbedUrl(item.url);
            return (
              <div
                key={item.label}
                className="break-before-page min-h-[297mm] p-8 print:p-0"
              >
                <h2 className="text-lg font-semibold mb-4">{item.label}</h2>
                <div className="border border-gray-200 h-[250mm]">
                  <object
                    data={embedUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <iframe src={embedUrl} className="w-full h-full" />
                  </object>
                </div>
                <div className="text-xs text-gray-500 mt-3 print:hidden">
                  Jika preview tidak muncul, buka PDF di tab baru.
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline mt-2 inline-block print:hidden"
                >
                  Buka PDF
                </a>
              </div>
            );
          }

          return (
            <div
              key={item.label}
              className="break-before-page min-h-[297mm] p-8 print:p-0"
            >
              <h2 className="text-lg font-semibold mb-4">{item.label}</h2>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                Buka Lampiran
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
