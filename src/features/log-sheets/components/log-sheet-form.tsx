'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useLogSheetTechnicians } from '@/features/log-sheets/hooks/use-log-sheet-technicians';

const formatDateForInput = (date?: unknown) => {
  if (!date) return '';
  const d = new Date(date as any);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateFromInput = (value: string) => {
  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  return new Date(year, month - 1, day);
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
  const { technicians } = useLogSheetTechnicians();

  const form = useForm({
    resolver: zodResolver(CreateLogSheetSchema),
    defaultValues: {
      projectId,
      date: new Date(),
      notes: '',
      replacedByUserId: undefined,
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

        if (result.success) {
          toast.success('Log sheet berhasil dibuat');
          const createdId = result.data.id;
          if (createdId) onCreated?.(createdId);
          onSuccess();
          form.reset({ projectId, date: new Date(), notes: '' } as any);
        } else {
          toast.error('Gagal membuat log sheet', {
            description: result.error,
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
          name="replacedByUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Digantikan Oleh (Opsional)</FormLabel>
              <Select
                value={field.value ?? 'none'}
                onValueChange={v => field.onChange(v === 'none' ? null : v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Teknisi Pengganti" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">- Tidak Ada Pengganti -</SelectItem>
                  {technicians.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName || ''}
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={e =>
                    field.onChange(parseDateFromInput(e.target.value))
                  }
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
