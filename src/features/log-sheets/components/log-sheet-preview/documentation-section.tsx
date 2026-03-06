import React from 'react';
import { LogSheetHeader } from '../log-sheet-header';
import { makeEntryKey } from '../../utils';
import type { TParameter, TLogSheetPhoto, TEntryState } from '../../types';

interface IDocumentationPhoto {
  type: 'before' | 'after' | 'water';
  url: string;
  caption?: string;
  paramName?: string;
}

function chunkPhotos<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function normalizePhotos(
  displayParameters: TParameter[],
  valuesByKey: Record<string, TEntryState | undefined>,
  photos: TLogSheetPhoto[]
): IDocumentationPhoto[] {
  const waterPhotoEntries = displayParameters.flatMap(param => {
    if (param.category !== 'CONSUMPTION') return [];
    const isWaterMeter = ['before', 'after'].some(k =>
      param.name.toLowerCase().includes(k)
    );
    if (!isWaterMeter) return [];

    const key = makeEntryKey(param.id, null, 'VALUE');
    const entry = valuesByKey[key];
    if (entry?.fileUrl) {
      return [{ param, url: entry.fileUrl }];
    }
    return [];
  });

  const beforePhotos = photos
    .filter(p => p.type === 'BEFORE')
    .map(p => ({
      type: 'before' as const,
      url: p.url,
      caption: p.caption ?? undefined,
    }));
  const afterPhotos = photos
    .filter(p => p.type === 'AFTER')
    .map(p => ({
      type: 'after' as const,
      url: p.url,
      caption: p.caption ?? undefined,
    }));
  const waterPhotos = waterPhotoEntries.map(entry => ({
    type: 'water' as const,
    url: entry.url,
    paramName: entry.param.name,
  }));

  return [...beforePhotos, ...afterPhotos, ...waterPhotos];
}

export function DocumentationSection({
  customerName,
  date,
  byName,
  replacedByName,
  displayParameters,
  valuesByKey,
  photos,
  maxPhotosPerPage = 6,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
  replacedByName?: string | null;
  displayParameters: TParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
  photos: TLogSheetPhoto[];
  maxPhotosPerPage?: number;
}) {
  const allPhotos = normalizePhotos(displayParameters, valuesByKey, photos);

  if (allPhotos.length === 0) return null;

  const photoPages = chunkPhotos(allPhotos, maxPhotosPerPage);

  return (
    <>
      {photoPages.map((pagePhotos, pageIndex) => (
        <div
          key={pageIndex}
          className={`break-before-page flex flex-col min-h-[297mm] border border-black p-4 ${
            pageIndex === 0 ? 'mt-8' : 'mt-0'
          } print:border-t print:min-h-0`}
        >
          <LogSheetHeader
            customerName={customerName}
            date={date}
            byName={byName}
            replacedByName={replacedByName}
          />
          <div className="flex-1 border border-black border-t-0 p-4">
            <h2 className="text-lg font-bold mb-8 text-center underline">
              DOCUMENTATION
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {pagePhotos
                .filter(p => p.type === 'before')
                .map(p => (
                  <div key={`before-${p.url}`} className="space-y-2">
                    <div className="font-bold text-center underline">
                      SEBELUM
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="aspect-square w-full relative border border-black">
                          <img
                            src={p.url}
                            alt="Sebelum"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-center text-xs">
                          {p.caption ?? ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {pagePhotos
                .filter(p => p.type === 'after')
                .map(p => (
                  <div key={`after-${p.url}`} className="space-y-2">
                    <div className="font-bold text-center underline">
                      SESUDAH
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="aspect-square w-full relative border border-black">
                          <img
                            src={p.url}
                            alt="Sesudah"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center text-xs">
                          {p.caption ?? ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {pagePhotos
                .filter(p => p.type === 'water')
                .map(p => (
                  <div
                    key={`water-${p.paramName}-${p.url}`}
                    className="space-y-2 col-span-2"
                  >
                    <div className="font-bold text-center underline">
                      WATER METER - {p.paramName}
                    </div>
                    <div className="aspect-square w-full relative border border-black">
                      <img
                        src={p.url}
                        alt={p.paramName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
