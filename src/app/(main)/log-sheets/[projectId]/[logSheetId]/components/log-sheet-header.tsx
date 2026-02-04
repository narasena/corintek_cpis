import Image from 'next/image';

export function LogSheetHeader({
  customerName,
  date,
  byName,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
}) {
  const formattedDate =
    typeof date === 'string'
      ? new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : date.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

  return (
    <div className="mb-2 print:mb-1">
      {/* Top Header with Logo and Company Name */}
      <div className="flex items-center justify-center gap-2 mb-2 print:mb-1">
        <div className="relative w-10 h-10">
          <Image
            src="/logo.png"
            alt="Corintek Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-base font-bold text-blue-900 uppercase leading-none">
            PT. CORINTEK INTI SEJAHTERA
          </h1>
          <p className="text-blue-900 text-xs leading-none">
            Water Treatment and Chemicals Specialist
          </p>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex justify-between items-end text-[10px] font-semibold px-1">
        <div>
          <div>
            Customer : <span className="font-bold">{customerName}</span>
          </div>
          <div>
            Date <span className="font-bold ml-8">{formattedDate}</span>
          </div>
        </div>
        <div>
          By <span className="font-bold">{byName}</span>
        </div>
      </div>
    </div>
  );
}
