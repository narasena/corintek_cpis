'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTransition } from 'react';
import {
  chemicalCreateSchema,
  chemicalUpdateSchema,
  TChemicalCreateInput,
  TChemicalUpdateInput,
  TChemical,
  ChemicalCategoryLabel,
} from '@/@types/chemical.type';
import {
  createChemicalAction,
  updateChemicalAction,
} from '@/features/chemicals/actions';
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

interface IChemicalFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<TChemical>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChemicalForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
}: IChemicalFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TChemicalCreateInput | TChemicalUpdateInput>({
    resolver: zodResolver(
      mode === 'create' ? chemicalCreateSchema : chemicalUpdateSchema
    ),
    defaultValues:
      mode === 'create'
        ? {
            name: '',
            unit: '',
            description: '',
            category: undefined,
          }
        : {
            name: defaultValues?.name || '',
            unit: defaultValues?.unit || '',
            description: defaultValues?.description || '',
            category: defaultValues?.category,
          },
  });

  const onSubmit = async (
    data: TChemicalCreateInput | TChemicalUpdateInput
  ) => {
    startTransition(async () => {
      let result;

      if (mode === 'create') {
        result = await createChemicalAction(data as TChemicalCreateInput);
      } else {
        if (!defaultValues?.id) {
          toast.error('Kesalahan Implementasi', {
            description: 'ID Chemical diperlukan untuk pembaruan',
          });
          return;
        }
        result = await updateChemicalAction({
          ...data,
          id: defaultValues.id,
        } as TChemicalUpdateInput);
      }

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Chemical berhasil dibuat'
            : 'Chemical berhasil diperbarui'
        );
        form.reset();
        onSuccess?.();
      } else {
        toast.error(
          mode === 'create'
            ? 'Gagal membuat chemical'
            : 'Gagal memperbarui chemical',
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Chemical</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: S-3000"
                  {...field}
                  value={field.value as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value as string}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori chemical" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ChemicalCategoryLabel).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satuan (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Kg, L"
                  {...field}
                  value={(field.value as string) ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Keterangan tambahan..."
                  {...field}
                  value={(field.value as string) ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
