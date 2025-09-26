import { useState, useEffect } from 'react';
import { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form';

export function useImagePreview<TFormData extends FieldValues, TFieldName extends FieldPath<TFormData>>() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImagePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<TFormData, TFieldName>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
    field.onChange(file ? file.name : '');
  };

  return { previewUrl, handleImagePreview };
}
