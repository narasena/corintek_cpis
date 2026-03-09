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
    <div className="flex flex-col">
      <span className="text-sm md:text-base font-medium leading-tight">
        {title}
      </span>
      {subtitle && (
        <>
          <span className="text-xs md:text-sm text-muted-foreground/80 mt-0.5">
            {subtitle}
          </span>
          <span className="text-xs text-muted-foreground/60 mt-0.5">
            {formatDate()}
          </span>
        </>
      )}
    </div>
  );
}
