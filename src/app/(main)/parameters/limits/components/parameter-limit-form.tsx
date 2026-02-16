'use client';

import { useTransition } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  UpdateParameterLimitInputSchema,
  TUpdateParameterLimitInput,
  IParameterLimitMasterItem,
} from '@/features/parameters/types';
import { updateParameterLimitAction } from '@/features/parameters/actions';

function parseNumberOrNull(value: string) {
  if (value === '') return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function handleNumberChange(field: {
  onChange: (value: number | null) => void;
}) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(parseNumberOrNull(event.target.value));
  };
}

interface ParameterLimitFormProps {
  parameter: IParameterLimitMasterItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParameterLimitForm({
  parameter,
  onSuccess,
  onCancel,
}: ParameterLimitFormProps) {
  const [isPending, startTransition] = useTransition();
  const isNumber = parameter.valueType === 'NUMBER';

  const form = useForm<TUpdateParameterLimitInput>({
    resolver: zodResolver(UpdateParameterLimitInputSchema),
    defaultValues: {
      parameterId: parameter.parameterId,
      minValue: parameter.minValue,
      maxValue: parameter.maxValue,
      rawWaterMinValue: parameter.rawWaterMinValue,
      rawWaterMaxValue: parameter.rawWaterMaxValue,
    },
  });

  const onSubmit = (values: TUpdateParameterLimitInput) => {
    if (!isNumber) {
      toast.error('Batas parameter hanya untuk tipe angka');
      return;
    }
    startTransition(async () => {
      const result = await updateParameterLimitAction(values);
      if (result.success) {
        toast.success('Batas parameter diperbarui');
        onSuccess();
      } else {
        toast.error('Gagal memperbarui batas parameter', {
          description: result.error,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input value={parameter.name} readOnly />
          <Input value={parameter.variableName} readOnly />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input value={parameter.category} readOnly />
          <Input value={parameter.unit ?? '-'} readOnly />
        </div>

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
                    disabled={!isNumber}
                    value={field.value ?? ''}
                    onChange={handleNumberChange(field)}
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
                    disabled={!isNumber}
                    value={field.value ?? ''}
                    onChange={handleNumberChange(field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rawWaterMinValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raw Min</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    disabled={!isNumber}
                    value={field.value ?? ''}
                    onChange={handleNumberChange(field)}
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
                <FormLabel>Raw Max</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    disabled={!isNumber}
                    value={field.value ?? ''}
                    onChange={handleNumberChange(field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
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
