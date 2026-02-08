'use client';

import React from 'react';
import { WorkReportHeader } from './work-report-header';
import { WorkReportPhotoType } from '@/generated/prisma/enums';
import Image from 'next/image';

interface WorkReportPreviewProps {
  data: {
    project: { name: string };
    date: Date;
    situation: string;
    workDone: string;
    workResult: string;
    machines: { type: string; unitNumber: number; brand: string | null }[];
    photos: {
      url: string;
      caption: string | null;
      type: WorkReportPhotoType;
    }[];
  };
}

export function WorkReportPreview({ data }: WorkReportPreviewProps) {
  const beforePhotos = data.photos.filter(p => p.type === 'BEFORE');
  const afterPhotos = data.photos.filter(p => p.type === 'AFTER');
  const generalPhotos = data.photos.filter(p => p.type === 'GENERAL');

  return (
    <div className="bg-white text-black text-sm leading-tight w-[210mm] mx-auto shadow-xl print:shadow-none print:w-full print:mx-0">
      {/* Page 1: Report Details */}
      <div className="min-h-[297mm] p-8 print:p-0 flex flex-col relative">
        <WorkReportHeader customerName={data.project.name} date={data.date} />

        <div className="space-y-6 flex-grow">
          {/* Machines */}
          {data.machines.length > 0 && (
            <div className="border border-black p-4">
              <h3 className="font-bold mb-2 uppercase text-xs text-gray-500">
                Unit / Mesin
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.machines.map((m, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 px-2 py-1 rounded border border-gray-300 print:border-black print:bg-transparent"
                  >
                    {m.type.replace(/_/g, ' ')} #{m.unitNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Sections */}
          <div className="grid gap-6">
            <Section title="Kondisi / Situasi" content={data.situation} />
            <Section title="Pekerjaan Yang Dilakukan" content={data.workDone} />
            <Section title="Hasil Pekerjaan" content={data.workResult} />
          </div>

          {/* Signature Area - Positioned at bottom of first page content or fixed at bottom of page */}
          <div className="mt-auto pt-12 flex justify-between break-inside-avoid">
            <div className="text-center w-40">
              <p className="mb-24 font-semibold">Dikerjakan Oleh,</p>
              <div className="border-t border-black pt-1">
                <p>Teknisi</p>
              </div>
            </div>
            <div className="text-center w-40">
              <p className="mb-24 font-semibold">Mengetahui,</p>
              <div className="border-t border-black pt-1">
                <p>{data.project.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2+: Photo Documentation */}
      <div className="min-h-[297mm] p-8 print:p-0 break-before-page relative">
        {/* Visual separator for screen view */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-300 print:hidden -mt-1" />

        {/* Header for Page 2 */}
        <div className="mb-6 border-b border-black pb-2 text-right">
          <span className="font-bold uppercase text-xs text-gray-500">
            Lampiran Dokumentasi - {data.project.name}
          </span>
        </div>

        <h3 className="font-bold text-center text-lg mb-8 uppercase underline">
          DOKUMENTASI PEKERJAAN
        </h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Before */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-center border-b-2 border-black pb-2 mb-2">
              SEBELUM (BEFORE)
            </h4>
            {beforePhotos.map((photo, idx) => (
              <PhotoItem key={idx} photo={photo} />
            ))}
            {beforePhotos.length === 0 && (
              <div className="text-center text-gray-400 italic py-10 border border-dashed border-gray-300 rounded">
                Tidak ada foto
              </div>
            )}
          </div>

          {/* Right Column: After */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-center border-b-2 border-black pb-2 mb-2">
              SESUDAH (AFTER)
            </h4>
            {afterPhotos.map((photo, idx) => (
              <PhotoItem key={idx} photo={photo} />
            ))}
            {afterPhotos.length === 0 && (
              <div className="text-center text-gray-400 italic py-10 border border-dashed border-gray-300 rounded">
                Tidak ada foto
              </div>
            )}
          </div>
        </div>

        {/* General Photos if any */}
        {generalPhotos.length > 0 && (
          <div className="mt-8 pt-8 border-t border-dashed border-gray-400">
            <h4 className="font-bold mb-4">LAIN-LAIN (GENERAL)</h4>
            <div className="grid grid-cols-2 gap-4">
              {generalPhotos.map((photo, idx) => (
                <PhotoItem key={idx} photo={photo} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body { background: #fff; }
            .break-before-page { break-before: page; }
            .break-after-page { break-after: page; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `,
        }}
      />
    </div>
  );
}

function PhotoItem({
  photo,
}: {
  photo: { url: string; caption: string | null };
}) {
  return (
    <div className="border border-black p-2 break-inside-avoid bg-white">
      <div className="relative aspect-[4/3] w-full mb-2">
        <Image
          src={photo.url}
          alt={photo.caption || 'Work Photo'}
          fill
          className="object-contain"
        />
      </div>
      {photo.caption && (
        <p className="text-center text-xs italic border-t border-gray-200 pt-1">
          {photo.caption}
        </p>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="border border-black">
      <div className="bg-gray-100 print:bg-gray-200 border-b border-black px-4 py-2 font-bold uppercase text-xs">
        {title}
      </div>
      <div className="p-4 whitespace-pre-wrap min-h-[100px]">{content}</div>
    </div>
  );
}
