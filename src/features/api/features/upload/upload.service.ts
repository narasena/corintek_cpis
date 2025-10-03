import baseUrl from '@/utils/api/baseUrl';
import apiInstance from '@/utils/apiInstance';
import { AppError } from '@/lib/app-error';

export async function imageUpload(imageFormData: FormData) {
  try {
    const uploadResponse = await apiInstance.post(
      `${baseUrl}/upload`,
      imageFormData
    );
    console.log(
      'Uploaded avatar URL:',
      uploadResponse.data.url,
      'Public ID:',
      uploadResponse.data.publicId
    );

    return {
      url: uploadResponse.data.url,
      publicId: uploadResponse.data.public_id,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new AppError({
      status: 500,
      message: 'Error uploading image',
      isExpose: true,
    });
  }
}
