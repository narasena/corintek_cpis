'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  createParameterAction,
  updateParameterAction,
} from '@/features/parameters/actions';
import {
  CreateParameterSchema,
  TCreateParameter,
  IParameter,
  ParameterCategoryEnum,
  ValueTypeEnum,
} from '@/features/parameters/types';
import { AlertCircle } from 'lucide-react';

interface ParameterFormProps {
  mode: 'create' | 'edit';
  defaultValues?: IParameter;
  onSuccess: () => void;
  onCancel: () => void;
  hasExistingLimits?: boolean;
}

// Indonesian labels for enums
const categoryLabels: Record<string, string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Kualitas Air Pendingin',
  GENERAL_CONDITION: 'Kondisi Umum',
  JOB_DESCRIPTION: 'Deskripsi Pekerjaan',
  CONSUMPTION: 'Konsumsi',
  LAB_ANALYSIS: 'Lab Analysis',
};

const valueTypeLabels: Record<string, string> = {
  NUMBER: 'Angka',
  BOOLEAN: 'Ya/Tidak',
  TEXT: 'Teks',
};

export function ParameterForm({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
  hasExistingLimits = false,
}: ParameterFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(CreateParameterSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      variableName: defaultValues?.variableName || '',
      category: defaultValues?.category || 'UNIT_CONDENSOR',
      valueType: defaultValues?.valueType || 'NUMBER',
      unit: defaultValues?.unit || '',
      minValue: defaultValues?.minValue || undefined,
      maxValue: defaultValues?.maxValue || undefined,
      rawWaterMinValue: defaultValues?.rawWaterMinValue || undefined,
      rawWaterMaxValue: defaultValues?.rawWaterMaxValue || undefined,
      displayOrder: defaultValues?.displayOrder || 0,
      isActive: defaultValues?.isActive ?? true,
      hasLimits: defaultValues?.hasLimits ?? true,
    },
  });

  const selectedValueType = form.watch('valueType');
  const selectedCategory = form.watch('category');
  const hasLimits = form.watch('hasLimits');

  const onSubmit = (data: TCreateParameter) => {
    startTransition(async () => {
      try {
        let result;
        if (mode === 'create') {
          result = await createParameterAction(data);
        } else {
          if (!defaultValues?.id) {
            toast.error('ID parameter tidak ditemukan');
            return;
          }
          // @ts-ignore
          result = await updateParameterAction({
            ...data,
            id: defaultValues.id,
          });
        }

        if (result && result.success) {
          toast.success(
            mode === 'create'
              ? 'Parameter berhasil dibuat'
              : 'Parameter berhasil diperbarui'
          );
          onSuccess();
        } else {
          toast.error(result?.error || 'Terjadi kesalahan');
        }
      } catch {
        toast.error('Terjadi kesalahan yang tidak terduga');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
            <TabsTrigger
              value="limits"
              disabled={selectedValueType !== 'NUMBER'}
            >
              Batas Limit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Parameter</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Temp (C°) In" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Variabel</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: temp_c_in" {...field} />
                    </FormControl>
                    <FormDescription>
                      Label unik di database (huruf kecil & _)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ParameterCategoryEnum.options.map(category => (
                          <SelectItem key={category} value={category}>
                            {categoryLabels[category]}
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
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Nilai</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe nilai" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ValueTypeEnum.options.map(type => (
                          <SelectItem key={type} value={type}>
                            {valueTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: °C, ppm, µS"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan Tampilan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">
                      Parameter Aktif
                    </FormLabel>
                    <FormDescription>
                      Aktifkan untuk mulai mengumpulkan data parameter ini.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="limits" className="space-y-4 outline-none">
            {selectedValueType === 'NUMBER' ? (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="hasLimits"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-foreground">
                          Gunakan Batas Limit
                        </FormLabel>
                        <FormDescription>
                          Parameter ini memiliki batas toleransi aman.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {mode === 'edit' && !hasLimits && hasExistingLimits && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-900">
                        Perhatian Konfigurasi Limit
                      </p>
                      <p className="text-amber-700 mt-1">
                        Parameter ini memiliki data limit yang tersimpan.
                        Menonaktifkan batas limit akan menghapus aturan evaluasi
                        kualitas sebelumnya.
                      </p>
                    </div>
                  </div>
                )}

                {hasLimits && (
                  <div className="space-y-6 bg-muted/10 p-4 border rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">
                      Konfigurasi Nilai Ambang Batas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nilai Minimum</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0"
                                {...field}
                                value={field.value ?? ''}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
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
                            <FormLabel>Nilai Maksimum</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                placeholder="100"
                                {...field}
                                value={field.value ?? ''}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedCategory === 'COOLING_WATER_QUALITY' && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-sm font-semibold mb-4">
                          Limit Air Baku (Raw Water)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="rawWaterMinValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Raw Water</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e =>
                                      field.onChange(
                                        e.target.value
                                          ? parseFloat(e.target.value)
                                          : undefined
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
                                <FormLabel>Max Raw Water</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="any"
                                    placeholder="100"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e =>
                                      field.onChange(
                                        e.target.value
                                          ? parseFloat(e.target.value)
                                          : undefined
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10 border rounded-lg border-dashed">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>
                  Batas limit hanya tersedia untuk parameter bertipe{' '}
                  <strong>Angka</strong>.
                </p>
                <p className="text-sm">
                  Ubah tipe nilai di tab Informasi Dasar untuk mengatur limit.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-[-24px] -mx-6 -mb-6 mt-8 p-4 px-6 border-t bg-background/95 backdrop-blur-sm flex justify-end gap-2 z-10">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Parameter'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
