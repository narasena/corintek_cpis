'use client';

import React from 'react';
import { WorkReportHeader } from './work-report-header';
import Image from 'next/image';

interface WorkReportPreviewProps {
  data: {
    project: { name: string };
    date: Date;
    situation: string;
    workDone: string;
    workResult: string;
    machines: { name: string; unitNumber: number }[];
    photos: { url: string; caption: string | null }[];
  };
}

export function WorkReportPreview({ data }: WorkReportPreviewProps) {
  return (
    <div className="bg-white text-black text-sm leading-tight w-[210mm] min-h-[297mm] mx-auto shadow-xl print:shadow-none print:w-full print:min-h-0 print:mx-0 p-8 print:p-0">
      <WorkReportHeader customerName={data.project.name} date={data.date} />

      <div className="space-y-6">
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
                  {m.name} #{m.unitNumber}
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

        {/* Photos */}
        {data.photos.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold mb-4 uppercase border-b border-black inline-block">
              Dokumentasi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {data.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="border border-black p-2 break-inside-avoid"
                >
                  <div className="relative aspect-[4/3] w-full mb-2">
                    {/* Use standard img for print compatibility issues sometimes with Next Image, but Next Image is fine if optimized=false or configured. Using standard img for simplicity in print preview if needed, but let's use Next Image. */}
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo ${idx + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-center text-xs italic">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Area */}
        <div className="mt-12 flex justify-between break-inside-avoid">
          <div className="text-center w-40">
            <p className="mb-16 font-semibold">Dikerjakan Oleh,</p>
            <div className="border-t border-black pt-1">
              <p>Teknisi</p>
            </div>
          </div>
          <div className="text-center w-40">
            <p className="mb-16 font-semibold">Mengetahui,</p>
            <div className="border-t border-black pt-1">
              <p>{data.project.name}</p>
            </div>
          </div>
        </div>
      </div>
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
