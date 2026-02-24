import React from 'react';
import { LogSheetHeader } from '../log-sheet-header';
import { makeEntryKey } from '../../utils';
import type { TParameter, TLogSheetPhoto, TEntryState } from '../../types';

export function DocumentationSection({
  customerName,
  date,
  byName,
  replacedByName,
  displayParameters,
  valuesByKey,
  photos,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
  replacedByName?: string | null;
  displayParameters: TParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
  photos: TLogSheetPhoto[];
}) {
  const photoEntries = displayParameters.flatMap(param => {
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

  const beforePhotos = photos.filter(photo => photo.type === 'BEFORE');
  const afterPhotos = photos.filter(photo => photo.type === 'AFTER');
  const hasDocumentation =
    photoEntries.length > 0 ||
    beforePhotos.length > 0 ||
    afterPhotos.length > 0;

  if (!hasDocumentation) return null;

  return (
    <div className="break-before-page flex flex-col min-h-[297mm] border border-black p-1 mt-8 print:mt-0 print:border-t print:min-h-0">
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
          {beforePhotos.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-center underline">SEBELUM</div>
              <div className="grid grid-cols-2 gap-4">
                {beforePhotos.map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <div className="aspect-square w-full relative border border-black">
                      <img
                        src={p.url}
                        alt="Sebelum"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center text-xs">{p.caption ?? ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {afterPhotos.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-center underline">SESUDAH</div>
              <div className="grid grid-cols-2 gap-4">
                {afterPhotos.map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <div className="aspect-square w-full relative border border-black">
                      <img
                        src={p.url}
                        alt="Sesudah"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center text-xs">{p.caption ?? ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {photoEntries.length > 0 && (
            <div className="space-y-2 col-span-2">
              <div className="font-bold text-center underline">WATER METER</div>
              <div className="grid grid-cols-2 gap-8">
                {photoEntries.map(entry => (
                  <div
                    key={entry.param.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="font-bold border border-black px-4 py-1 bg-blue-200 w-full text-center">
                      {entry.param.name}
                    </div>
                    <div className="aspect-square w-full relative border border-black">
                      <img
                        src={entry.url}
                        alt={entry.param.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
