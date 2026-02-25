import React from 'react';

export function SignaturesSection({
  customerName,
  corintekPicName,
  clientPicName,
  technicianSignatureUrl,
  clientPicSignatureUrl,
  approvedAtText,
  submittedAtText,
}: {
  customerName: string;
  corintekPicName?: string | null;
  clientPicName?: string | null;
  technicianSignatureUrl?: string | null;
  clientPicSignatureUrl?: string | null;
  approvedAtText: string;
  submittedAtText: string;
}) {
  return (
    <div className="border-t border-black flex">
      <div className="w-1/2 border-r border-black flex flex-col">
        <div className="text-center font-bold p-[2px] border-b border-black">
          PT Corintek Inti Sejahtera
        </div>
        <div className="text-center font-bold p-[2px] border-b border-black">
          PIC ( Corintek )
        </div>
        <div className="h-28 flex flex-col items-center justify-between py-2">
          <div className="flex-1 flex items-center justify-center">
            {technicianSignatureUrl && (
              <img
                src={technicianSignatureUrl}
                alt="Tanda tangan teknisi"
                className="max-h-16 max-w-[120px] object-contain"
              />
            )}
          </div>
          <div className="text-center text-[10px] font-semibold leading-tight pb-1">
            <div>{corintekPicName ?? '-'}</div>
            {approvedAtText ? <div>{approvedAtText}</div> : null}
          </div>
        </div>
      </div>
      <div className="w-1/2 flex flex-col">
        <div className="text-center font-bold p-[2px] border-b border-black">
          {customerName}
        </div>
        <div className="text-center font-bold p-[2px] border-b border-black">
          Check By ( Client )
        </div>
        <div className="h-28 flex flex-col items-center justify-between py-2">
          <div className="flex-1 flex items-center justify-center">
            {clientPicSignatureUrl && (
              <img
                src={clientPicSignatureUrl}
                alt="Tanda tangan klien"
                className="max-h-16 max-w-[120px] object-contain"
              />
            )}
          </div>
          <div className="text-center text-[10px] font-semibold leading-tight pb-1">
            <div>{clientPicName ?? '-'}</div>
            {submittedAtText ? <div>{submittedAtText}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
