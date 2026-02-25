import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import type { ILogSheetPhoto } from './types';
import {
  assertLogSheetEditable,
  type TLogSheetEditOptions,
} from './internal/edit-permission';

export async function upsertLogSheetPhotos(
  actor: IJwtPayload,
  logSheetId: string,
  photos: Array<{
    id?: string;
    type: ILogSheetPhoto['type'];
    url: string;
    caption?: string | null;
  }>,
  options?: TLogSheetEditOptions
) {
  await assertLogSheetEditable(actor, logSheetId, options);

  const existing = await prisma.logSheetPhoto.findMany({
    where: { logSheetId },
    select: { id: true, deletedAt: true },
  });

  const existingById = new Map(existing.map(photo => [photo.id, photo]));
  const seenIds = new Set<string>();

  await prisma.$transaction(async tx => {
    const now = new Date();

    for (const photo of photos) {
      if (photo.id && existingById.has(photo.id)) {
        seenIds.add(photo.id);
        await tx.logSheetPhoto.update({
          where: { id: photo.id },
          data: {
            type: photo.type,
            url: photo.url,
            caption: photo.caption ?? null,
            deletedAt: null,
          },
        });
        continue;
      }

      const created = await tx.logSheetPhoto.create({
        data: {
          logSheetId,
          type: photo.type,
          url: photo.url,
          caption: photo.caption ?? null,
        },
      });
      seenIds.add(created.id);
    }

    for (const existingPhoto of existing) {
      if (seenIds.has(existingPhoto.id)) continue;
      if (existingPhoto.deletedAt === null) {
        await tx.logSheetPhoto.update({
          where: { id: existingPhoto.id },
          data: { deletedAt: now },
        });
      }
    }
  });
}
