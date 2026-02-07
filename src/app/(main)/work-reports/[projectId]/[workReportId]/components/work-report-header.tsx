import Image from 'next/image';

export function WorkReportHeader({
  customerName,
  date,
}: {
  customerName: string;
  date: string | Date;
}) {
  const formattedDate =
    typeof date === 'string'
      ? new Date(date).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

  return (
    <div className="mb-4 print:mb-2 border-b border-black pb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <Image
              src="/logo.png"
              alt="Corintek Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 uppercase leading-none">
              PT. CORINTEK INTI SEJAHTERA
            </h1>
            <p className="text-blue-900 text-sm">
              Water Treatment and Chemicals Specialist
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase border-2 border-black px-4 py-1 inline-block">
            WORK REPORT
          </h2>
        </div>
      </div>

      <div className="flex justify-between items-end text-sm font-semibold">
        <div>
          Customer : <span className="font-bold uppercase">{customerName}</span>
        </div>
        <div>
          Date : <span className="font-bold">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
