'use client';

import { usePathname } from 'next/navigation';

const SUBTITLES: Record<string, string> = {
  '/': 'Ringkasan aktivitas dan data penting',
  '/projects': 'Kelola proyek Anda',
  '/log-sheets': 'Catat dan lihat semua lembar kerja',
  '/equipment': 'Kelola inventaris peralatan',
  '/employees': 'Kelola data teknisi',
  '/clients': 'Kelola data klien',
  '/settings': 'Konfigurasi sistem',
};

const formatSegment = (str: string) =>
  str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const formatDate = () => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
};

const getTitle = (path: string) => {
  if (path === '/') return 'Dashboard';
  const segments = path.substring(1).split('/');
  if (segments.length === 0) return 'Dashboard';
  return formatSegment(segments[0]);
};

export function HeaderTitle() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const subtitle = SUBTITLES[pathname] || '';

  return (
    <div className="flex flex-col justify-center">
      <h2 className="text-base md:text-lg font-bold leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 leading-none mt-1">
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {subtitle}
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="text-[10px] md:text-xs text-muted-foreground/60 font-medium">
            {formatDate()}
          </span>
        </div>
      )}
    </div>
  );
}
