import { FieldValues } from 'react-hook-form';

export default function formDataToObject<TFormData extends FieldValues>(
  formData: FormData,
  imageField?: string
) {
  const data: Partial<TFormData> = {};
  const image = imageField ? (formData.get(imageField) as File) : null;
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    console.log(
      'Parsed avatarImg:',
      image instanceof File
        ? `${image.name} (${image.size} bytes)`
        : 'Null/No file'
    );
  }
  for (const [key, value] of formData.entries()) {
    if (key !== 'avatarImg' && value !== null) {
      const fieldKey = key as keyof TFormData;
      if (fieldKey === 'role' || fieldKey === 'employmentStatus') {
        data[fieldKey] = value as any; // Enums as strings
      } else {
        (data as any)[fieldKey] = value as string;
      }
    }
  }

  console.log('Extracted data before Zod:', data); // Log for validation

  return { data, image };
}
