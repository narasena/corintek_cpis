'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getCategoryWithLimitsAction,
  upsertCategoryLimitsAction,
  copyFromMasterDefaultsAction,
} from '@/features/parameter-limit-categories/actions';
import { getParametersAction } from '@/features/parameters/actions';
import type {
  ICategoryWithLimits,
  IParameterLimit,
} from '@/features/parameter-limit-categories/types';
import type { IParameter } from '@/features/parameters/types';

export default function ParameterLimitEditorPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;

  const [category, setCategory] = useState<ICategoryWithLimits | null>(null);
  const [parameters, setParameters] = useState<IParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [catResult, paramResult] = await Promise.all([
      getCategoryWithLimitsAction(categoryId),
      getParametersAction(),
    ]);

    if (!catResult.success) {
      toast.error('Gagal memuat kategori', {
        description: catResult.error ?? 'Unknown error',
      });
      return;
    }
    setCategory(catResult.data as ICategoryWithLimits);

    if (paramResult.success && Array.isArray(paramResult.data)) {
      setParameters(paramResult.data as IParameter[]);
    }

    setLoading(false);
  }, [categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!category) return;

    setSaving(true);
    const limits = category.limits.map(limit => ({
      parameterId: limit.parameterId,
      minValue: limit.minValue,
      maxValue: limit.maxValue,
      rawWaterMinValue: limit.rawWaterMinValue,
      rawWaterMaxValue: limit.rawWaterMaxValue,
    }));

    const result = await upsertCategoryLimitsAction({
      categoryId,
      limits,
    });

    if (result.success) {
      toast.success('Batas parameter berhasil disimpan');
      fetchData();
    } else {
      toast.error('Gagal menyimpan', {
        description: result.error ?? 'Unknown error',
      });
    }
    setSaving(false);
  };

  const handleCopyFromMaster = async () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin menyalin batas default dari master parameter?'
      )
    ) {
      return;
    }

    const result = await copyFromMasterDefaultsAction({
      categoryId,
      overwriteExisting: false,
    });

    if (result.success) {
      toast.success(
        `Berhasil menyalin ${result.data.copied} batas parameter dari master`
      );
      fetchData();
    } else {
      toast.error('Gagal menyalin', {
        description: result.error ?? 'Unknown error',
      });
    }
  };

  const updateLimit = (
    parameterId: string,
    field: keyof IParameterLimit,
    value: number | null
  ) => {
    if (!category) return;

    setCategory({
      ...category,
      limits: category.limits.map(limit =>
        limit.parameterId === parameterId ? { ...limit, [field]: value } : limit
      ),
    });
  };

  const groupedLimits = useMemo(() => {
    if (!category) return {};

    const groups: Record<string, typeof category.limits> = {};
    for (const limit of category.limits) {
      const param = parameters.find(p => p.id === limit.parameterId);
      const group = param?.category ?? 'OTHER';
      if (!groups[group]) groups[group] = [];
      groups[group].push(limit);
    }
    return groups;
  }, [category, parameters]);

  const groupLabels: Record<string, string> = {
    UNIT_CONDENSOR: 'Unit Condensor',
    UNIT_EVAPORATOR: 'Unit Evaporator',
    COOLING_WATER_QUALITY: 'Kualitas Air Cooling',
    GENERAL_CONDITION: 'Kondisi Umum',
    JOB_DESCRIPTION: 'Deskripsi Pekerjaan',
    CONSUMPTION: 'Konsumsi',
    LAB_ANALYSIS: 'Analisa Lab',
    OTHER: 'Lainnya',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return <div>Kategori tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.category.name}</h1>
          <p className="text-muted-foreground">
            {category.category.description ?? 'Kategori batas parameter'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyFromMaster}>
            <Copy className="mr-2 h-4 w-4" />
            Salin dari Master
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      {category.limits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/20">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium">Belum ada batas parameter</p>
              <p className="text-sm mt-2">
                Salin dari master parameter untuk memulai mengedit batas.
              </p>
            </div>
            <Button onClick={handleCopyFromMaster}>
              <Copy className="mr-2 h-4 w-4" />
              Salin dari Master
            </Button>
          </div>
        </div>
      ) : (
        Object.entries(groupedLimits).map(([group, limits]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{groupLabels[group] ?? group}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {limits.map(limit => {
                  const param = parameters.find(
                    p => p.id === limit.parameterId
                  );
                  return (
                    <div
                      key={limit.parameterId}
                      className="space-y-2 p-3 border rounded-lg"
                    >
                      <Label className="text-sm font-medium">
                        {param?.name ?? limit.parameterId}
                        {param?.unit && (
                          <span className="text-muted-foreground">
                            {' '}
                            ({param.unit})
                          </span>
                        )}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Min
                          </Label>
                          <Input
                            type="number"
                            step="any"
                            value={limit.minValue ?? ''}
                            onChange={e =>
                              updateLimit(
                                limit.parameterId,
                                'minValue',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="Min"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Max
                          </Label>
                          <Input
                            type="number"
                            step="any"
                            value={limit.maxValue ?? ''}
                            onChange={e =>
                              updateLimit(
                                limit.parameterId,
                                'maxValue',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="Max"
                          />
                        </div>
                      </div>
                      {param?.category === 'COOLING_WATER_QUALITY' && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Raw Min
                            </Label>
                            <Input
                              type="number"
                              step="any"
                              value={limit.rawWaterMinValue ?? ''}
                              onChange={e =>
                                updateLimit(
                                  limit.parameterId,
                                  'rawWaterMinValue',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="Raw Min"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Raw Max
                            </Label>
                            <Input
                              type="number"
                              step="any"
                              value={limit.rawWaterMaxValue ?? ''}
                              onChange={e =>
                                updateLimit(
                                  limit.parameterId,
                                  'rawWaterMaxValue',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="Raw Max"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
