'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CreateLogSheetSchema } from '@/features/log-sheets/types';
import { createLogSheetAction } from '@/features/log-sheets/actions';

const formatDateForInput = (date?: unknown) => {
  if (!date) return '';
  return new Date(date as any).toISOString().split('T')[0];
};

interface ILogSheetFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onCreated?: (logSheetId: string) => void;
}

export function LogSheetForm({
  projectId,
  onSuccess,
  onCancel,
  onCreated,
}: ILogSheetFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(CreateLogSheetSchema),
    defaultValues: {
      projectId,
      date: new Date(),
      notes: '',
    },
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const notes = data.notes?.trim();
        const result = await createLogSheetAction({
          ...data,
          notes: notes ? notes : undefined,
        });

        if (result.success && result.data) {
          toast.success('Log sheet berhasil dibuat');
          const createdId = (result.data as any).id as string | undefined;
          if (createdId) onCreated?.(createdId);
          onSuccess();
          form.reset({ projectId, date: new Date(), notes: '' } as any);
        } else {
          toast.error('Gagal membuat log sheet', {
            description: result.error || 'Terjadi kesalahan',
          });
        }
      } catch {
        toast.error('Terjadi kesalahan yang tidak terduga');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={e => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Catatan singkat..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Membuat...' : 'Buat Log Sheet'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
