import { TUserCreationAttributes } from '@/types/user.type';
import { useImagePreview } from '@/hooks/useImagePreview';
import React, { JSX } from 'react';
import {  useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreationSchema } from '../schemas/userSchema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  IconInfoSquareFilled,
  IconUserCircle,
} from '@tabler/icons-react';
import z from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useImageUpload from '@/hooks/useImageUpload';
import { createUserFormFields } from '../data/userFormFields';
import { toast } from 'sonner';
import errorMessageResponse from '@/utils/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import DefaultForm from '@/components/default-form';

export default function UserForm() {
  const createUserForm = useForm<TUserCreationAttributes>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      employmentStatus: undefined,
      avatarImg: null,
    },
  });

  const { previewUrl, handleImagePreview } = useImagePreview<
    TUserCreationAttributes,
    'avatarImg'
  >();
  const { file, handleUpload, result, setFile, uploading } = useImageUpload();

  const onSubmit = async (data: TUserCreationAttributes) => {
    try {
      console.log('onSubmit called');
      console.log('Valid form:', createUserForm.formState.isValid);
      console.log(
        'avatarImg in data:',
        data.avatarImg instanceof File ? 'File object' : data.avatarImg
      );

      // Create FormData
      const formData = new FormData();

      // Append non-file fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'avatarImg' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append file
      const avatarFile = data.avatarImg;
      if (avatarFile) {
        if (avatarFile instanceof File) {
          formData.append('avatarImg', avatarFile);
          console.log('Appended file to FormData:', avatarFile.name); // Log for validation
        }
      }

      console.log('FormData has avatarImg:', formData.has('avatarImg')); // Log for validation
      console.log(
        'All FormData entries:',
        Array.from(formData.entries()).map(
          ([k, v]) => `${k}: ${v instanceof File ? 'File' : v}`
        )
      ); // Detailed log

      // // Use fetch for multipart
      // const response = await fetch('/api/users/create', {
      //   method: 'POST',
      //   body: formData, // Auto-sets multipart/form-data
      // });

      // if (!response.ok) {
      //   const errorData = (await response.json().catch(() => ({}))) as {
      //     message?: string;
      //     errors?: Array<{ message: string }>;
      //   };
      //   console.error('Backend response error:', errorData);
      //   throw new Error(
      //     errorData.message ||
      //       errorData.errors?.[0]?.message ||
      //       'Submission failed'
      //   );
      // }

      // const result = (await response.json()) as {
      //   message?: string;
      //   data?: any;
      // };

      const response = await apiInstance.postForm("users/create", formData);
      if(response.data.status !== 201){
        throw new Error('Submission failed');
      }
      const result = response.data as {
        message?: string;
        data?: any;
      }


      console.log('Backend success response:', result);
      toast.success(result.message || 'User created successfully');
      createUserForm.reset();
    } catch (error) {
      toast.error(errorMessageResponse(error));
      console.error('Submit error:', error);
    }
  };

  const onInvalid = (errors: Record<string, any>) => {
    console.log('Form validation failed');
    console.log('isValid:', createUserForm.formState.isValid);
    console.log('Full errors:', JSON.stringify(errors, null, 2));
  };

  return (
    <DefaultForm<TUserCreationAttributes>
    form={createUserForm}
    onSubmit={onSubmit}
    onInvalid={onInvalid}
    avatar={
      {
        key: 'avatarImg',
        previewUrl: previewUrl || '',
        onChange: handleImagePreview
      }
    }
    formFields={createUserFormFields}
    validationSchema={userCreationSchema as any}
    />
  );
}
