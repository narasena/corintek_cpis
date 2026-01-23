'use client';

import { useParams } from 'next/navigation';
import useLogSheetDetails from '../../hooks/useLogSheetDetails';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Printer, FileText } from 'lucide-react';

type PageSize = 'a4' | 'letter';

export default function LogSheetPrintPage() {
  const params = useParams();
  const { id } = params;
  const { logSheetDetails, isLoading } = useLogSheetDetails(id as string);
  const [pageSize, setPageSize] = useState<PageSize>('a4');

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-12 text-gray-500" />
      </div>
    );
  }

  if (!logSheetDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Log Sheet Not Found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The requested log sheet could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Get machine counts - assuming we need to fetch project data or get from log sheet
  // For now, let's assume we have access to project data with chillers and coolingTowers
  // Since logSheetDetails.project only has name, we'll need to make this dynamic
  const chillerCount = 6; // Default to 6 as mentioned
  const coolingTowerCount = 6; // Default to 6 as mentioned

  return (
    <div className={`print-container ${pageSize}`}>
      {/* Print Controls - Hidden in print */}
      <div className="print:hidden mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Print Log Sheet
            </h1>
            <Badge variant="outline" className="text-sm">
              ID: {logSheetDetails.id}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-size"
                className="text-sm font-medium text-gray-700"
              >
                Page Size:
              </label>
              <Select
                value={pageSize}
                onValueChange={(value: PageSize) => setPageSize(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter/F4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Log Sheet
            </Button>
          </div>
        </div>
      </div>

      {/* Print Content - Table Format */}
      <div className="print-content">
        <table className="log-sheet-table">
          {/* Header Section */}
          <thead>
            <tr>
              <th colSpan={chillerCount + 1} className="header-cell">
                <div className="header-content">
                  <h1 className="text-2xl font-bold">LOG SHEET</h1>
                  <p className="text-sm text-gray-600">
                    PT. CORINTEK INTI SEJAHTERA - Water Treatment and Chemicals
                    Specialist
                  </p>
                </div>
              </th>
            </tr>
            <tr>
              <th
                colSpan={Math.ceil((chillerCount + 1) / 3)}
                className="info-cell"
              >
                <strong>Customer:</strong> {logSheetDetails.project.name}
              </th>
              <th
                colSpan={Math.ceil((chillerCount + 1) / 3)}
                className="info-cell"
              >
                <strong>Date:</strong>{' '}
                {new Date(logSheetDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </th>
              <th
                colSpan={Math.ceil((chillerCount + 1) / 3)}
                className="info-cell"
              >
                <strong>Log Sheet ID:</strong> {logSheetDetails.id}
              </th>
            </tr>
          </thead>

          {/* Parameter Sections */}
          <tbody>
            {logSheetDetails.details?.map(detail => {
              const isWaterQuality = detail.groupInfo.name
                .toLowerCase()
                .includes('water quality');
              const isChillerSection =
                detail.groupInfo.name.toLowerCase().includes('condensor') ||
                detail.groupInfo.name.toLowerCase().includes('evaporator');
              const unitCount = isChillerSection
                ? chillerCount
                : coolingTowerCount;

              // Group parameters by unit for table display
              const unitMap = new Map();
              detail.units?.forEach(unit => {
                if (unit.unitInfo) {
                  unitMap.set(unit.unitInfo.unitNumber, unit.parameters || []);
                }
              });

              const maxParams = Math.max(
                ...Array.from(unitMap.values()).map(params => params.length)
              );

              const rows = [];

              // Section header with unit columns
              rows.push(
                <tr key={`${detail.groupInfo.id}-header`}>
                  <th className="section-header">Parameter</th>
                  {Array.from({ length: unitCount }, (_, i) => (
                    <th key={`unit-${i + 1}`} className="section-header">
                      Unit {String(i + 1).padStart(2, '0')}
                    </th>
                  ))}
                  {isWaterQuality && (
                    <>
                      <th className="section-header">Raw Water</th>
                      <th className="section-header">Raw Water Limit</th>
                    </>
                  )}
                </tr>
              );

              // Parameter rows
              for (let paramIndex = 0; paramIndex < maxParams; paramIndex++) {
                const parameterRow = (
                  <tr key={`param-${detail.groupInfo.id}-${paramIndex}`}>
                    <td className="parameter-cell">
                      {unitMap.get(1)?.[paramIndex] && (
                        <div>
                          <div className="parameter-name">
                            {unitMap.get(1)[paramIndex].name}
                            {unitMap.get(1)[paramIndex].unit &&
                              ` (${unitMap.get(1)[paramIndex].unit})`}
                          </div>
                          {unitMap.get(1)[paramIndex].description && (
                            <div className="parameter-desc text-xs text-gray-500">
                              {unitMap.get(1)[paramIndex].description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    {Array.from({ length: unitCount }, (_, unitIndex) => (
                      <td
                        key={`unit-${unitIndex + 1}-param-${paramIndex}`}
                        className="value-cell"
                      >
                        {unitMap.get(unitIndex + 1)?.[paramIndex] && (
                          <div className="value-display">
                            {unitMap.get(unitIndex + 1)[paramIndex].value ===
                              null ||
                            unitMap.get(unitIndex + 1)[paramIndex].value ===
                              undefined
                              ? '-'
                              : unitMap.get(unitIndex + 1)[paramIndex]
                                    .valueType === 'BOOLEAN'
                                ? unitMap.get(unitIndex + 1)[paramIndex].value
                                  ? 'Yes'
                                  : 'No'
                                : unitMap.get(unitIndex + 1)[paramIndex].value}
                          </div>
                        )}
                      </td>
                    ))}
                    {isWaterQuality && (
                      <>
                        <td className="value-cell">
                          {/* Raw water data would go here */}-
                        </td>
                        <td className="value-cell">
                          {/* Raw water limit would go here */}-
                        </td>
                      </>
                    )}
                  </tr>
                );
                rows.push(parameterRow);
              }

              return rows;
            })}

            {/* Chemical Consumption Section */}
            <tr>
              <td colSpan={chillerCount + 1} className="section-header">
                <strong>Chemical Consumption</strong>
              </td>
            </tr>
            <tr>
              <td className="parameter-cell">Chemical Name</td>
              {Array.from({ length: chillerCount }, (_, i) => (
                <td key={`chemical-${i + 1}`} className="value-cell">
                  {/* Chemical data would go here */}-
                </td>
              ))}
            </tr>

            {/* Water Consumption Section */}
            <tr>
              <td colSpan={chillerCount + 1} className="section-header">
                <strong>Water Consumption</strong>
              </td>
            </tr>
            <tr>
              <td className="parameter-cell">Meter Reading</td>
              {Array.from({ length: chillerCount }, (_, i) => (
                <td key={`water-${i + 1}`} className="value-cell">
                  {/* Water consumption data would go here */}-
                </td>
              ))}
            </tr>

            {/* Footer */}
            <tr>
              <td colSpan={chillerCount + 1} className="footer-cell">
                <div className="footer-content">
                  <div className="signature-section">
                    <div>PIC (Corintek):</div>
                    <div>___________________________</div>
                  </div>
                  <div className="signature-section">
                    <div>Check By:</div>
                    <div>___________________________</div>
                  </div>
                  <div className="print-info">
                    Generated by CORINTEK CPIS on{' '}
                    {new Date().toLocaleDateString()} at{' '}
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            .print-container.a4 {
              --page-width: 210mm;
              --page-height: 297mm;
            }

            .print-container.letter {
              --page-width: 8.5in;
              --page-height: 11in;
            }

            @page {
              size: var(--page-width) var(--page-height);
              margin: 20mm;
            }

            .print-content {
              font-size: 12pt;
              line-height: 1.4;
            }

            .log-sheet-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }

            .log-sheet-table th,
            .log-sheet-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }

            .header-cell {
              text-align: center;
              background-color: #f0f0f0;
              font-size: 14pt;
              font-weight: bold;
            }

            .info-cell {
              background-color: #f9f9f9;
              font-size: 11pt;
            }

            .section-header {
              background-color: #e0e0e0;
              font-weight: bold;
              font-size: 12pt;
            }

            .parameter-cell {
              font-weight: bold;
              min-width: 120px;
            }

            .value-cell {
              text-align: center;
              min-width: 80px;
            }

            .notes-cell {
              padding: 12px;
              font-style: italic;
            }

            .footer-cell {
              background-color: #f9f9f9;
              text-align: center;
            }

            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
            }

            .signature-section {
              flex: 1;
              text-align: center;
            }

            .print-info {
              font-size: 9pt;
              color: #666;
              margin-top: 10px;
            }
          }

          @media screen {
            .print-content {
              max-width: 1000px;
              margin: 0 auto;
              overflow-x: auto;
            }

            .log-sheet-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 14px;
            }

            .log-sheet-table th,
            .log-sheet-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }

            .header-cell {
              text-align: center;
              background-color: #f8f9fa;
            }

            .info-cell {
              background-color: #f8f9fa;
            }

            .section-header {
              background-color: #e9ecef;
              font-weight: bold;
            }

            .parameter-cell {
              font-weight: bold;
              min-width: 120px;
            }

            .value-cell {
              text-align: center;
              min-width: 80px;
            }
          }
        `,
        }}
      />
    </div>
  );
}
