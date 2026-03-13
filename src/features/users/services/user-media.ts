import { uploadToR2 } from '@/lib/r2-upload';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

/**
 * Validates and uploads a user avatar to R2 storage.
 *
 * @param userId - ID of the user owning the avatar
 * @param file - The image file from the form data
 * @returns The public URL of the uploaded avatar
 * @throws Error if file is missing, invalid type, or exceeds size limit
 */
export async function uploadUserAvatar(
  userId: string,
  file: File | null
): Promise<string> {
  if (!file) {
    throw new Error('File tidak ditemukan');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar');
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('Ukuran file maksimal 5MB');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `avatars/${userId}/${Date.now()}-${file.name}`;

  const url = await uploadToR2({
    key,
    body: buffer,
    contentType: file.type,
  });

  return url;
}
