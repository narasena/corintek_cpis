import Image from 'next/image';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface IPhoto {
  id: string;
  url: string;
  type: string;
  caption: string | null;
  createdAt: Date;
  logSheet: {
    date: Date;
    project: {
      name: string;
    };
  };
}

interface IProps {
  photos: IPhoto[];
}

export function RecentPhotosGallery({ photos }: IProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg border border-dashed border-border/60 bg-muted/5 p-8 text-center">
        Belum ada foto terbaru hari ini.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {photos.map(photo => (
        <div
          key={photo.id}
          className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
        >
          {photo.url && (
            <Image
              src={photo.url}
              alt={photo.caption || photo.type}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col justify-end p-2 text-white">
            <span className="text-xs font-semibold truncate leading-tight">
              {photo.logSheet.project.name}
            </span>
            <span className="text-[10px] text-gray-300">
              {format(new Date(photo.logSheet.date), 'dd MMM yyyy', {
                locale: id,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
