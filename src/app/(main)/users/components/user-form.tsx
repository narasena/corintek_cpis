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
import { createUserFormFields } from '../data/formFields';
import { toast } from 'sonner';
import errorMessageResponse from '@/utils/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';

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
    <Form {...createUserForm}>
      <form
        onSubmit={createUserForm.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8"
      >
        <div className="flex flex-col gap-3">
          <Label className="w-40">Upload Foto Profil</Label>
          <FormField
            control={createUserForm.control}
            name="avatarImg"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-6">
                    <Avatar className="size-25 rounded-full">
                      <AvatarImage
                        src={previewUrl || field.value || undefined}
                      />
                      <AvatarFallback className="bg-gray-400 p-3">
                        <IconUserCircle className='size-full text-slate-700'/>
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      className="w-full !h-10 !p-0 rounded-md border-none bg-[#4B5563] text-sm text-white file:!cursor-pointer file:h-full file:border-0 file:bg-blue-500 file:px-4 file:text-white hover:file:bg-blue-600"
                      onChange={e => {
                        const selectedFile = e.target.files?.[0] || null;
                        handleImagePreview(e);
                        setFile(selectedFile);
                        field.onChange(selectedFile);
                        console.log(
                          'Selected file in onChange:',
                          selectedFile
                            ? `${selectedFile.name} (${selectedFile.size} bytes)`
                            : 'No file'
                        );
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {createUserFormFields.map(formField => (
            <FormField
              key={formField.name}
              control={createUserForm.control}
              name={formField.name as keyof TUserCreationAttributes}
              render={({ field }) => {
                const fieldSchema =
                  userCreationSchema.shape[
                    formField.name as keyof TUserCreationAttributes
                  ];
                const Icon = formField.icon as JSX.ElementType;

                return (
                  <FormItem
                    className={formField.type === 'boolean' ? 'col-span-2' : formField.className? formField.className : ''}
                  >
                    {formField.type !== 'boolean' && (
                      <FormLabel>
                        {formField.label}{' '}
                        <Tooltip delayDuration={800}>
                          <TooltipTrigger>
                            <IconInfoSquareFilled className="size-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="!max-w-[160px] flex flex-wrap">
                            <p>{formField.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                    )}
                    <FormControl>
                      {formField.type === 'selectEnum' &&
                      fieldSchema instanceof z.ZodEnum ? (
                        <Select
                          onValueChange={value =>
                            field.onChange(value === '' ? undefined : value)
                          }
                          value={field.value as string | undefined}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Salah Satu" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldSchema.options.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : formField.type === 'boolean' ? (
                        <div className="flex items-center space-x-2 w-full">
                          <Checkbox
                            id={field.name}
                            checked={field.value as boolean | undefined}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                          />
                          <Label
                            htmlFor={field.name}
                            className="w-full hover:bg-primary/30 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 font-normal cursor-pointer"
                          >
                            <div className="grid gap-1.5">
                              <p className="text-sm leading-none font-medium flex items-center gap-2">
                                {formField.label}
                                {Icon && (
                                  <Icon className="size-4 text-gray-500" />
                                )}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {formField.description}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ) : (
                        <Input
                          type={formField.type}
                          placeholder={formField.placeHolder}
                          {...field}
                          value={(field.value as string) || ''}
                        />
                      )}
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
