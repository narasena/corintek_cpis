import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/errorMessageResponse';
import {
  FieldErrors,
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import { toast } from 'sonner';

interface IUseFormHandleSubmit<T extends FieldValues> {
  form: UseFormReturn<T>;
  imageKey?: Path<T>;
  apiUrl: string;
}

function isFile(value: unknown): value is File {
  return value instanceof File;
}

export default function useFormHandleSubmit<
  TFormAttributes extends FieldValues,
>(params: IUseFormHandleSubmit<TFormAttributes>) {
  const onSubmitWithImage: SubmitHandler<TFormAttributes> = async data => {
    try {
      if (params.imageKey) {
        if (
          process.env.NODE_ENV === 'development' ||
          process.env.NODE_ENV === 'test'
        ) {
          console.log('onSubmit called');
          console.log('Valid form:', params.form.formState.isValid);

          const fieldKey = String(params.imageKey);
          const fieldValue = data[params.imageKey] as unknown;

          const logValue = (() => {
            if (fieldValue === undefined || fieldValue === null) {
              return 'Null/No file';
            }

            if (isFile(fieldValue)) {
              return `File object: ${
                fieldValue.name || '[unnamed file]'
              } (${fieldValue.size} bytes)`;
            }

            if (fieldValue && fieldValue instanceof Blob) {
              return `Blob object: ${fieldValue.size} bytes`;
            }

            return fieldValue;
          })();
          console.log(`${fieldKey} in data:`, logValue);
        }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          const stringKey = String(key);
          if (stringKey !== String(params.imageKey)) {
            // For optional fields, send empty string instead of excluding
            if (value === null || value === undefined) {
              formData.append(stringKey, '');
            } else {
              formData.append(stringKey, String(value));
            }
          }
        });

        const avatarFile = data[params.imageKey];
        if (avatarFile && isFile(avatarFile)) {
          formData.append(String(params.imageKey), avatarFile);
          console.log('Appended file to FormData:', avatarFile.name);
        }

        console.log(
          'FormData has avatarImg:',
          formData.has(String(params.imageKey))
        );
        console.log(
          'All FormData entries:',
          Array.from(formData.entries()).map(
            ([k, v]) => `${k}: ${v instanceof File ? 'File' : v}`
          )
        );

        const response = await apiInstance.postForm(params.apiUrl, formData);
        console.log(response);
        if (response.data.status !== 201) {
          throw new Error(response.data.message || 'Submission failed');
        }
        console.log('Backend success response:', response.data);
        toast.success(response.data.message || 'Data created successfully');
        params.form.reset();
      }
    } catch (error) {
      toast.error(errorMessageResponse(error));
      console.error('Submit error:', error);
    }
  };

  const onInvalid = (errors: FieldErrors<TFormAttributes>) => {
    console.log('Form validation failed');
    console.log('isValid:', params.form.formState.isValid);
    console.log('Full errors:', JSON.stringify(errors, null, 2));
  };

  return {
    onSubmitWithImage,
    onInvalid,
  };
}
