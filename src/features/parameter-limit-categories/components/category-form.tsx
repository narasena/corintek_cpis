'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { z } from 'zod/v4';
import {
  CreateParameterLimitCategorySchema,
  UpdateParameterLimitCategorySchema,
  type IParameterLimitCategory,
} from '../types';
import { createCategoryAction, updateCategoryAction } from '../actions';

const formSchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean(),
});

type TFormValues = z.infer<typeof formSchema>;

interface ICategoryFormProps {
  initialData?: IParameterLimitCategory | null;
  onSuccess?: (category: IParameterLimitCategory) => void;
  onCancel?: () => void;
}

export function CategoryForm({
  initialData,
  onSuccess,
  onCancel,
}: ICategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      isDefault: initialData?.isDefault ?? false,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      let result;
      if (isEditMode && initialData) {
        result = await updateCategoryAction({
          id: initialData.id,
          ...data,
        });
      } else {
        result = await createCategoryAction(data);
      }

      if (result.success) {
        toast.success(isEditMode ? 'Kategori diperbarui' : 'Kategori dibuat', {
          description: `Kategori "${data.name}" berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}.`,
        });
        if ('category' in result.data) {
          onSuccess?.(result.data.category);
        } else {
          onSuccess?.(result.data as IParameterLimitCategory);
        }
      } else {
        toast.error('Gagal menyimpan', {
          description: result.error,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input
                  placeholder="contoh: Standard, Client XYZ Custom"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Nama unik untuk kategori limit parameter
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi opsional untuk kategori ini"
                  {...field}
                  value={field.value ?? ''}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>Keterangan tambahan untuk admin</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Kategori Default</FormLabel>
                <FormDescription>
                  Kategori ini akan digunakan sebagai default untuk proyek baru
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
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
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Perbarui' : 'Buat'} Kategori
          </Button>
        </div>
      </form>
    </Form>
  );
}
