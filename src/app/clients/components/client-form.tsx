'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition } from 'react';
import {
  clientCreateSchema,
  clientUpdateSchema,
  TClientCreateInput,
  TClientUpdateInput,
  TClientResponse,
} from '@/@types/client.type';
import {
  createClientAction,
  updateClientAction,
} from '@/features/clients/actions';
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

interface IClientFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TClientResponse>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
}: IClientFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TClientCreateInput | TClientUpdateInput>({
    resolver: zodResolver(
      mode === 'create' ? clientCreateSchema : clientUpdateSchema
    ),
    defaultValues:
      mode === 'create'
        ? {
            name: '',
            email: '',
            phoneNumber: '',
            address: '',
          }
        : {
            name: defaultValues?.name || '',
            email: defaultValues?.email || '',
            phoneNumber: defaultValues?.phoneNumber || '',
            address: defaultValues?.address || '',
          },
  });

  const onSubmit = async (data: TClientCreateInput | TClientUpdateInput) => {
    startTransition(async () => {
      let result;

      if (mode === 'create') {
        result = await createClientAction(data as TClientCreateInput);
      } else {
        if (!defaultValues?.id) {
          toast.error('Kesalahan Implementasi', {
            description: 'ID Klien diperlukan untuk pembaruan',
          });
          return;
        }
        result = await updateClientAction(
          defaultValues.id,
          data as TClientUpdateInput
        );
      }

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Klien berhasil dibuat'
            : 'Klien berhasil diperbarui'
        );
        form.reset();
        onSuccess?.();
      } else {
        toast.error(
          mode === 'create' ? 'Gagal membuat klien' : 'Gagal memperbarui klien',
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Klien</FormLabel>
              <FormControl>
                <Input placeholder="PT Example Indonesia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Opsional)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="+62 21 1234567"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jl. Contoh No. 123, Jakarta"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending
              ? mode === 'create'
                ? 'Membuat...'
                : 'Memperbarui...'
              : mode === 'create'
                ? 'Buat Klien'
                : 'Perbarui Klien'}
          </Button>
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
        </div>
      </form>
    </Form>
  );
}
