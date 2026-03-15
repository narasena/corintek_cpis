import React from 'react';
import Image from 'next/image';
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

function PhotoItem({ photo }: { photo: IDocumentationPhoto }) {
  return (
    <div className="border border-black p-2 break-inside-avoid bg-white">
      <div className="relative aspect-[4/3] w-full mb-2 print:aspect-[3/2]">
        <Image
          src={photo.url}
          alt={photo.caption || 'Documentation Photo'}
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

function EmptyPlaceholder() {
  return (
    <div className="flex-grow min-h-[200px] border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 italic">
      Tidak ada foto
    </div>
  );
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
            <div className="grid grid-cols-1 gap-8">
              {Array.from({
                length: Math.max(
                  pagePhotos.filter(p => p.type === 'before').length,
                  pagePhotos.filter(p => p.type === 'after').length
                ),
              }).map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 gap-8 break-inside-avoid"
                >
                  <div className="flex flex-col gap-2">
                    {idx === 0 && (
                      <div className="font-bold text-center underline">
                        SEBELUM
                      </div>
                    )}
                    {pagePhotos.filter(p => p.type === 'before')[idx] ? (
                      <PhotoItem
                        photo={pagePhotos.filter(p => p.type === 'before')[idx]}
                      />
                    ) : (
                      <EmptyPlaceholder />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {idx === 0 && (
                      <div className="font-bold text-center underline">
                        SESUDAH
                      </div>
                    )}
                    {pagePhotos.filter(p => p.type === 'after')[idx] ? (
                      <PhotoItem
                        photo={pagePhotos.filter(p => p.type === 'after')[idx]}
                      />
                    ) : (
                      <EmptyPlaceholder />
                    )}
                  </div>
                </div>
              ))}
              {pagePhotos.filter(p => p.type === 'water').length > 0 && (
                <div className="mt-8">
                  {/* Water Meter Header - merged across columns */}
                  <div className="font-bold text-center text-lg underline mb-6">
                    WATER METER
                  </div>
                  {/* Water Meter Photos - side by side */}
                  <div className="grid grid-cols-2 gap-8 break-inside-avoid">
                    {pagePhotos
                      .filter(p => p.type === 'water')
                      .map((p, idx) => (
                        <div
                          key={`water-${p.paramName}-${p.url}`}
                          className="flex flex-col gap-2"
                        >
                          <div className="border border-black p-2 break-inside-avoid bg-white">
                            <div className="relative aspect-[4/3] w-full mb-2">
                              <img
                                src={p.url}
                                alt={p.paramName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-center text-xs font-semibold">
                              {p.paramName}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
