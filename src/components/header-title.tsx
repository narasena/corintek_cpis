'use client';

import { usePathname } from 'next/navigation';

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

  return (
    <div className="flex flex-col justify-center">
      <h2 className="text-[27px] md:text-2xl font-semibold leading-none tracking-tight">
        {title}
      </h2>
      <span className="text-xs text-primary-foreground/60 mt-1">
        {formatDate()}
      </span>
    </div>
  );
}
