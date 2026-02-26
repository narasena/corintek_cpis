'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod/v4';
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
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateParameterLimitAction } from '../../parameters/actions';
import type { IParameterLimitMasterItem } from '../../parameters/types';

const formSchema = z.object({
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  rawWaterMinValue: z.number().nullable().optional(),
  rawWaterMaxValue: z.number().nullable().optional(),
});

type TFormValues = z.infer<typeof formSchema>;

interface IParameterLimitDialogProps {
  mode: 'edit';
  limit?: IParameterLimitMasterItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ParameterLimitDialog({
  mode,
  limit,
  open,
  onOpenChange,
  onSuccess,
}: IParameterLimitDialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minValue: limit?.minValue ?? null,
      maxValue: limit?.maxValue ?? null,
      rawWaterMinValue: limit?.rawWaterMinValue ?? null,
      rawWaterMaxValue: limit?.rawWaterMaxValue ?? null,
    },
  });

  useEffect(() => {
    if (limit) {
      form.reset({
        minValue: limit.minValue,
        maxValue: limit.maxValue,
        rawWaterMinValue: limit.rawWaterMinValue,
        rawWaterMaxValue: limit.rawWaterMaxValue,
      });
    }
  }, [limit, form]);

  const onSubmit = (data: TFormValues) => {
    if (!limit) return;

    startTransition(async () => {
      const result = await updateParameterLimitAction({
        parameterId: limit.parameterId,
        minValue: data.minValue,
        maxValue: data.maxValue,
        rawWaterMinValue: data.rawWaterMinValue,
        rawWaterMaxValue: data.rawWaterMaxValue,
      });

      if (result.success) {
        toast.success('Batas parameter berhasil diperbarui');
        handleOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Gagal memperbarui batas parameter');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Batas Parameter: {limit?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rawWaterMinValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Air Mentah Min</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rawWaterMaxValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Air Mentah Max</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
