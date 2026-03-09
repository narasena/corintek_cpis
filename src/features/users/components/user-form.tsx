'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition, useEffect, useState } from 'react';
import {
  userCreateSchema,
  userUpdateSchema,
  TUserCreateInput,
  TUserUpdateInput,
  TUserResponse,
  UserRole,
  EmploymentStatus,
  TUserRole,
} from '@/@types/user.type';
import { createUserAction, updateUserAction } from '@/features/users/actions';
import { getAllClientsAction } from '@/features/clients/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';

interface IUserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TUserResponse>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CLIENT_ROLES: TUserRole[] = [
  'CLIENT',
  'CLIENT_TECHNICIAN',
  'CLIENT_SUPERVISOR',
];

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
}: IUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const form = useForm<TUserCreateInput | TUserUpdateInput>({
    resolver: zodResolver(
      mode === 'create' ? userCreateSchema : userUpdateSchema
    ),
    defaultValues:
      mode === 'create'
        ? {
            firstName: '',
            lastName: '',
            idNumber: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            address: '',
            role: undefined,
            employmentStatus: undefined,
            clientId: null,
          }
        : {
            firstName: defaultValues?.firstName || '',
            lastName: defaultValues?.lastName || '',
            idNumber: defaultValues?.idNumber || '',
            email: defaultValues?.email || '',
            phoneNumber: defaultValues?.phoneNumber || '',
            address: defaultValues?.address || '',
            role: defaultValues?.role,
            employmentStatus: defaultValues?.employmentStatus,
            clientId: defaultValues?.clientId || null,
          },
  });

  const selectedRole = useWatch({ control: form.control, name: 'role' });
  const isClientRole =
    selectedRole && CLIENT_ROLES.includes(selectedRole as TUserRole);

  useEffect(() => {
    if (isClientRole) {
      setIsLoadingClients(true);
      getAllClientsAction()
        .then(result => {
          if (result.success && result.data) {
            setClients(result.data);
          } else {
            toast.error('Gagal memuat data klien');
          }
        })
        .catch(() => toast.error('Gagal memuat data klien'))
        .finally(() => setIsLoadingClients(false));
    }
  }, [isClientRole]);

  const onSubmit = async (data: TUserCreateInput | TUserUpdateInput) => {
    startTransition(async () => {
      let result;

      if (mode === 'create') {
        result = await createUserAction(data as TUserCreateInput);
      } else {
        if (!defaultValues?.id) {
          toast.error('Kesalahan Implementasi', {
            description: 'ID Pengguna diperlukan untuk pembaruan',
          });
          return;
        }
        result = await updateUserAction(
          defaultValues.id,
          data as TUserUpdateInput
        );
      }

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Pengguna berhasil dibuat'
            : 'Pengguna berhasil diperbarui'
        );
        form.reset();
        onSuccess?.();
      } else {
        toast.error(
          mode === 'create'
            ? 'Gagal membuat pengguna'
            : 'Gagal memperbarui pengguna',
          {
            description: result.error || 'Terjadi kesalahan',
          }
        );
        form.setError('root', {
          type: 'manual',
          message: result.error || 'An error occurred',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Data Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Depan</FormLabel>
                    <FormControl>
                      <Input placeholder="Budi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Belakang</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Santoso"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="+62812xxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Identitas (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jl. Sudirman No 1..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Akun & Akses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="budi.santoso@contoh.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'create' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min 8 karakter"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Konfirmasi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran (Role)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih peran pengguna" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(UserRole).map(role => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Kepegawaian</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EmploymentStatus).map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isClientRole && (
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client (Perusahaan)</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { label: '- Tidak Ada -', value: 'none' },
                          ...clients.map(c => ({ label: c.name, value: c.id })),
                        ]}
                        value={field.value || 'none'}
                        onChange={value =>
                          field.onChange(value === 'none' ? null : value)
                        }
                        placeholder={
                          isLoadingClients ? 'Memuat data...' : 'Cari klien...'
                        }
                        searchPlaceholder="Ketik nama klien..."
                        emptyMessage="Klien tidak ditemukan."
                        disabled={isLoadingClients}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-[-24px] -mx-6 -mb-6 mt-8 p-4 px-6 border-t bg-background/95 backdrop-blur-sm flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === 'create'
                ? 'Menyimpan...'
                : 'Memperbarui...'
              : mode === 'create'
                ? 'Tambah Pengguna'
                : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
