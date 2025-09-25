import { TUserAttributes } from '@/app/types/user.type';
import React from 'react';
import { Controller, ControllerRenderProps, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import userSchema from '../schemas/userSchema';
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
  IconLockFilled,
  IconUserCircle,
} from '@tabler/icons-react';
import z from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function UserForm() {
  const form = useForm<TUserAttributes>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      IDNumber: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: undefined,
      employmentStatus: undefined,
      avatarUrl: '',
      avatarPublicId: '',
      isActive: true,
      isBlocked: false,
    },
  });

  const formFields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'Nama Depan',
      placeHolder: 'John',
      description:
        'Masukkan nama depan sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nama Belakang',
      placeHolder: 'Doe',
      description:
        'Masukkan nama belakang sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'IDNumber',
      type: 'text',
      label: 'ID Number',
      placeHolder: 'ID-12345',
      description:
        'Masukkan nomor identitas sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'phoneNumber',
      type: 'text',
      label: 'Nomor Telepon',
      placeHolder: '088812345678',
      description:
        'Masukkan nomor telepon sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeHolder: 'Y2mE2@example.com',
      description:
        'Masukkan email sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeHolder: 'Password',
      description: "Buat password untuk user"
    },
    {
      name: 'role',
      type: 'selectEnum',
      label: 'Role',
      placeHolder: 'TECHNICIAN',
      description:
        'Masukkan role sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'employmentStatus',
      type: 'selectEnum',
      label: 'Employment Status',
      placeHolder: 'PERMANENT',
      description:
        'Masukkan status kerja sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'isActive',
      type: 'boolean',
      label: 'Aktif',
      placeHolder: 'true',
      description:
        'Masih aktif bekerja',
    },
    {
      name: 'isBlocked',
      icon: IconLockFilled,
      type: 'boolean',
      label: 'Blokir',
      placeHolder: 'false',
      description:
        'Blokir / batasi akses user / pengguna',
    },
  ];

  const onSubmit = (data: TUserAttributes) => {
    console.log('onSubmit called');
    console.log(form.formState.isValid);
    console.log(data);
    console.log("Submit");
  };

  const onInvalid = (errors: any) => {
    console.log('Form validation failed');
    console.log('isValid:', form.formState.isValid);
    console.log('Errors:', errors);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        <div className="flex flex-col gap-3">
          <Label className="w-40">Upload Foto Profil</Label>
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Controller
                    control={form.control}
                    name="avatarUrl"
                    render={({ field: controllerField }) => (
                      <div className="flex items-center gap-6">
                        <Avatar className="size-25 rounded-full">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback className="bg-gray-400">
                            <IconUserCircle />
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          type="file"
                          accept="image/*"
                          className="w-full !h-10 !p-0 rounded-md border-none bg-[#4B5563] text-sm text-white file:!cursor-pointer file:h-full file:border-0 file:bg-blue-500 file:px-4 file:text-white hover:file:bg-blue-600"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            controllerField.onChange(file ? file.name : '');
                          }}
                          value={controllerField.value || ''}
                        />
                      </div>
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {formFields.map(formField => (
            <FormField
              key={formField.name}
              control={form.control}
              name={formField.name as keyof TUserAttributes}
              render={({ field }) => {
                const fieldSchema =
                  userSchema.shape[formField.name as keyof TUserAttributes];
                const Icon = formField.icon;

                return (
                  <FormItem
                    className={formField.type === 'boolean' ? 'col-span-2' : ''}
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
                          onValueChange={field.onChange}
                          value={field.value as string}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={formField.placeHolder} />
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
                            id={field.name} // Use field name for unique id
                            checked={field.value === "true"}
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
                          value={field.value as string || ''}
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
