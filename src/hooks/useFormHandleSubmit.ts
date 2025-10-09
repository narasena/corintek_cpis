import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import {
  FieldErrors,
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import { toast } from 'sonner';
import { TAuthLoginFormAttributes } from '@/types/auth.type';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface IUseFormHandleSubmit<T extends FieldValues> {
  form: UseFormReturn<T>;
  imageKey?: Path<T>;
  apiUrl?: string;
  refetch?: () => void;
}

function isFile(value: unknown): value is File {
  return value instanceof File;
}

export default function useFormHandleSubmit<
  TFormAttributes extends FieldValues,
>(params: IUseFormHandleSubmit<TFormAttributes>) {
  const route = useRouter();
  const { setUser } = useAuthStore();
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

        const response = await apiInstance.postForm(params.apiUrl!, formData);
        console.log(response);
        if (![200, 201].includes(response.data.status)) {
          throw new Error(response.data.message || 'Submission failed');
        }
        console.log('Backend success response:', response.data);

        if (params.refetch) {
          params.refetch();
        }
        toast.success(response.data.message || 'Data created successfully');
        params.form.reset();
      }
    } catch (error) {
      toast.error(errorMessageResponse(error));
      console.error('Submit error:', error);
    }
  };

  const onSubmit: SubmitHandler<TFormAttributes> = async data => {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test'
      ) {
        console.log('onSubmit called');
        console.log('Valid form:', params.form.formState.isValid);
        console.log('All FormData entries:', data);
      }
      const response = await apiInstance.post(params.apiUrl!, data);
      console.log(response);
      if (![200, 201].includes(response.data.status)) {
        throw new Error(response.data.message || 'Submission failed');
      }
      toast.success(response.data.message || 'Data created successfully');
      console.log('Backend success response:', response.data);
    } catch (error) {
      toast.error(errorMessageResponse(error));
      console.error('Submit error:', error);
    }
  };

  const onSubmitLogin: SubmitHandler<TAuthLoginFormAttributes> = async data => {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test'
      ) {
        console.log('onSubmit called');
        console.log('Valid form:', params.form.formState.isValid);
        console.log('All FormData entries:', data);
      }
      const response = await apiInstance.post('/auth', data);
      if (![200, 201].includes(response.data.status)) {
        throw new Error(response.data.message || 'Submission failed');
      }
      // The server response on login contains the user data (without the token)
      const user = response.data.loginToken;
      if (user && user.id && user.role) {
        setUser(user);
      }
      toast.success(response.data.message || 'Login success');
      setTimeout(() => {
        route.push('/');
      }, 3500);
    } catch (error) {
      // On login error, ensure the user state is cleared
      setUser(null);
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
    onSubmit,
    onSubmitLogin,
    onInvalid,
  };
}
