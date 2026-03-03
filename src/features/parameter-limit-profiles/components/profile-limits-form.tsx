'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { Loader2, Copy, Save } from 'lucide-react';

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

import {
  getProfileWithLimitsAction,
  upsertProfileLimitsAction,
  copyFromDefaultProfileAction,
} from '../actions';
import type { IParameterLimitProfile, IProfileWithLimits } from '../types';
import type { TParameterCategory } from '@/features/parameters/types';

// =============================================================================
// Constants
// =============================================================================

const CATEGORY_LABELS: Record<TParameterCategory, string> = {
  UNIT_CONDENSOR: 'Unit Condenser',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Kualitas Air Cooling',
  GENERAL_CONDITION: 'Kondisi Umum',
  JOB_DESCRIPTION: 'Deskripsi Pekerjaan',
  CONSUMPTION: 'Konsumsi',
  LAB_ANALYSIS: 'Analisa Lab',
};

const CATEGORY_ORDER: TParameterCategory[] = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
  'LAB_ANALYSIS',
];

// =============================================================================
// Schema
// =============================================================================

const LimitValueSchema = z.object({
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  rawWaterMinValue: z.number().nullable().optional(),
  rawWaterMaxValue: z.number().nullable().optional(),
});

const ProfileLimitsFormSchema = z.record(z.string().uuid(), LimitValueSchema);

type TProfileLimitsFormValues = z.infer<typeof ProfileLimitsFormSchema>;

// =============================================================================
// Types
// =============================================================================

interface IProfileLimitsFormProps {
  profile: IParameterLimitProfile;
  onSuccess?: () => void;
}

interface ILimitItem {
  parameterId: string;
  name: string;
  variableName: string;
  unit: string | null;
  category: TParameterCategory;
  displayOrder: number;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
}

// =============================================================================
// Component
// =============================================================================

export function ProfileLimitsForm({
  profile,
  onSuccess,
}: IProfileLimitsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isCopying, startCopying] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<IProfileWithLimits | null>(
    null
  );

  const form = useForm<TProfileLimitsFormValues>({
    resolver: zodResolver(ProfileLimitsFormSchema),
    defaultValues: {},
  });

  // Fetch profile with limits
  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProfileWithLimitsAction(profile.id);
      if (result.success && result.data) {
        setProfileData(result.data);

        // Convert limits to form default values
        const defaultValues: TProfileLimitsFormValues = {};
        result.data.limits.forEach(limit => {
          defaultValues[limit.parameterId] = {
            minValue: limit.minValue,
            maxValue: limit.maxValue,
            rawWaterMinValue: limit.rawWaterMinValue,
            rawWaterMaxValue: limit.rawWaterMaxValue,
          };
        });
        form.reset(defaultValues);
      } else {
        toast.error('Gagal mengambil data batas profil');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [profile.id, form]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Group limits by category (only show limits with at least one value set)
  const groupedLimits = useMemo(() => {
    if (!profileData) return [];

    const groups = new Map<TParameterCategory, ILimitItem[]>();

    profileData.limits.forEach(limit => {
      // Skip limits with all null values (empty entries for non-numeric params)
      const hasAnyValue =
        limit.minValue !== null ||
        limit.maxValue !== null ||
        limit.rawWaterMinValue !== null ||
        limit.rawWaterMaxValue !== null;

      if (!hasAnyValue) return;

      const item: ILimitItem = {
        parameterId: limit.parameterId,
        name: limit.parameterName,
        variableName: limit.parameterVariableName,
        unit: limit.parameterUnit,
        category: limit.parameterCategory,
        displayOrder: limit.parameterDisplayOrder,
        minValue: limit.minValue,
        maxValue: limit.maxValue,
        rawWaterMinValue: limit.rawWaterMinValue,
        rawWaterMaxValue: limit.rawWaterMaxValue,
      };

      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category)!.push(item);
    });

    // Sort by display order within each group
    groups.forEach(items => {
      items.sort((a, b) => a.displayOrder - b.displayOrder);
    });

    // Return in category order
    return CATEGORY_ORDER.map(category => ({
      category,
      label: CATEGORY_LABELS[category],
      items: groups.get(category) || [],
    })).filter(group => group.items.length > 0);
  }, [profileData]);

  // Handle copy from master defaults
  const handleCopyFromMaster = () => {
    if (
      !confirm(
        'Ini akan menyalin batas default dari master parameter ke profil ini. Lanjutkan?'
      )
    ) {
      return;
    }

    startCopying(async () => {
      const result = await copyFromDefaultProfileAction({
        profileId: profile.id,
        overwriteExisting: true,
      });

      if (result.success) {
        toast.success('Batas berhasil disalin', {
          description: `${result.data.copied} parameter diperbarui.`,
        });
        fetchProfileData();
        onSuccess?.();
      } else {
        toast.error('Gagal menyalin batas', {
          description: result.error,
        });
      }
    });
  };

  // Handle save
  const onSubmit = (data: TProfileLimitsFormValues) => {
    startTransition(async () => {
      const limits = Object.entries(data).map(([parameterId, values]) => ({
        parameterId,
        ...values,
      }));

      const result = await upsertProfileLimitsAction({
        profileId: profile.id,
        limits,
      });

      if (result.success) {
        toast.success('Batas parameter berhasil disimpan', {
          description: `${result.data.created} dibuat, ${result.data.updated} diperbarui.`,
        });
        onSuccess?.();
      } else {
        toast.error('Gagal menyimpan batas', {
          description: result.error,
        });
      }
    });
  };

  // Check if category needs raw water fields
  const needsRawWater = (category: TParameterCategory): boolean => {
    return category === 'COOLING_WATER_QUALITY';
  };

  // Only show limits for numeric parameters (hasLimits = true)
  const shouldShowLimits = (category: TParameterCategory): boolean => {
    return [
      'UNIT_CONDENSOR',
      'UNIT_EVAPORATOR',
      'COOLING_WATER_QUALITY',
      'LAB_ANALYSIS',
    ].includes(category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Memuat batas parameter...</p>
        </div>
      </div>
    );
  }

  if (!profileData || groupedLimits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">
            Belum ada batas parameter untuk profil ini.
          </p>
          <Button
            variant="outline"
            onClick={handleCopyFromMaster}
            disabled={isCopying}
          >
            {isCopying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Copy className="mr-2 h-4 w-4" />
            Salin dari Master Default
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Actions */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Kelola batas untuk setiap parameter dalam profil ini.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyFromMaster}
              disabled={isCopying}
            >
              {isCopying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Copy className="mr-2 h-4 w-4" />
              Salin dari Master
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </div>
        </div>

        {/* Limits by Category */}
        <Accordion type="multiple" defaultValue={[groupedLimits[0]?.category]}>
          {groupedLimits.map(({ category, label, items }) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {items.map(item => (
                    <div
                      key={item.parameterId}
                      className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg bg-muted/20"
                    >
                      {/* Parameter Info */}
                      <div className="col-span-12 sm:col-span-4">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.unit && (
                          <p className="text-xs text-muted-foreground">
                            Satuan: {item.unit}
                          </p>
                        )}
                      </div>

                      {/* Min/Max Inputs */}
                      <div className="col-span-12 sm:col-span-8">
                        <div
                          className={`grid gap-2 ${
                            needsRawWater(category)
                              ? 'grid-cols-2 sm:grid-cols-4'
                              : 'grid-cols-2'
                          }`}
                        >
                          <FormField
                            control={form.control}
                            name={`${item.parameterId}.minValue`}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs">Min</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="any"
                                    placeholder="-"
                                    className="h-8"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e =>
                                      field.onChange(
                                        e.target.value
                                          ? parseFloat(e.target.value)
                                          : null
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
                            name={`${item.parameterId}.maxValue`}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs">Max</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="any"
                                    placeholder="-"
                                    className="h-8"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e =>
                                      field.onChange(
                                        e.target.value
                                          ? parseFloat(e.target.value)
                                          : null
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {needsRawWater(category) && (
                            <>
                              <FormField
                                control={form.control}
                                name={`${item.parameterId}.rawWaterMinValue`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="text-xs">
                                      Air Mentah Min
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="any"
                                        placeholder="-"
                                        className="h-8"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e =>
                                          field.onChange(
                                            e.target.value
                                              ? parseFloat(e.target.value)
                                              : null
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
                                name={`${item.parameterId}.rawWaterMaxValue`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
                                    <FormLabel className="text-xs">
                                      Air Mentah Max
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="any"
                                        placeholder="-"
                                        className="h-8"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e =>
                                          field.onChange(
                                            e.target.value
                                              ? parseFloat(e.target.value)
                                              : null
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Simpan Semua Batas
          </Button>
        </div>
      </form>
    </Form>
  );
}
