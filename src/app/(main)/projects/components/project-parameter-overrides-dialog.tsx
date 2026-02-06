'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

import { getParametersAction } from '@/features/parameters/actions';
import {
  getProjectAction,
  upsertProjectParameterOverrideAction,
} from '@/features/projects/actions';
import { IProject } from '@/features/projects/types';
import { IParameter } from '@/features/parameters/types';

interface ProjectParameterOverridesDialogProps {
  project: IProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { id: 'UNIT_CONDENSOR', label: 'Unit Condensor' },
  { id: 'UNIT_EVAPORATOR', label: 'Unit Evaporator' },
  { id: 'COOLING_WATER_QUALITY', label: 'Water Quality' },
  { id: 'GENERAL_CONDITION', label: 'General' },
  { id: 'JOB_DESCRIPTION', label: 'Job Desc' },
  { id: 'CONSUMPTION', label: 'Consumption' },
];

export function ProjectParameterOverridesDialog({
  project,
  open,
  onOpenChange,
}: ProjectParameterOverridesDialogProps) {
  const [parameters, setParameters] = useState<IParameter[]>([]);
  const [currentProject, setCurrentProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && project) {
      fetchData(project.id);
    }
  }, [open, project]);

  const fetchData = async (projectId: string) => {
    setLoading(true);
    try {
      const [paramRes, projectRes] = await Promise.all([
        getParametersAction(),
        getProjectAction(projectId),
      ]);

      if (paramRes.success && paramRes.data) {
        setParameters(paramRes.data);
      }
      if (projectRes.success && projectRes.data) {
        setCurrentProject(projectRes.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getOverride = (paramId: string) => {
    return currentProject?.parameterOverrides?.find(
      (o) => o.parameterId === paramId
    );
  };

  const handleSave = async (
    paramId: string,
    field: 'minValue' | 'maxValue' | 'rawWaterMinValue' | 'rawWaterMaxValue',
    value: string
  ) => {
    if (!currentProject) return;

    const numValue = value === '' ? null : parseFloat(value);
    
    // Optimistic update
    const currentOverrides = currentProject.parameterOverrides || [];
    const existingOverrideIndex = currentOverrides.findIndex(
      (o) => o.parameterId === paramId
    );
    
    let newOverrides = [...currentOverrides];
    if (existingOverrideIndex >= 0) {
      newOverrides[existingOverrideIndex] = {
        ...newOverrides[existingOverrideIndex],
        [field]: numValue,
      };
    } else {
      // Need to construct a temporary override object
      // This part is tricky for optimistic update because we need full object shape
      // So we'll skip optimistic update for new entries and rely on server response
    }

    setSavingId(`${paramId}-${field}`);
    
    // Get current values to merge
    const existingOverride = getOverride(paramId);
    
    const payload = {
      projectId: currentProject.id,
      parameterId: paramId,
      minValue: existingOverride?.minValue,
      maxValue: existingOverride?.maxValue,
      rawWaterMinValue: existingOverride?.rawWaterMinValue,
      rawWaterMaxValue: existingOverride?.rawWaterMaxValue,
      [field]: numValue,
    };

    const res = await upsertProjectParameterOverrideAction(payload);

    if (res.success && res.data) {
      // Update local state with real data from server
      setCurrentProject((prev) => {
        if (!prev) return null;
        const overrides = prev.parameterOverrides || [];
        const idx = overrides.findIndex((o) => o.parameterId === paramId);
        
        let updatedOverrides;
        if (idx >= 0) {
          updatedOverrides = [...overrides];
          updatedOverrides[idx] = {
             ...updatedOverrides[idx],
             ...res.data,
             parameter: overrides[idx].parameter // Preserve parameter relation if needed
          };
        } else {
          updatedOverrides = [...overrides, { ...res.data, parameter: parameters.find(p => p.id === paramId) as any }];
        }
        
        return { ...prev, parameterOverrides: updatedOverrides };
      });
      // toast.success('Disimpan'); // Too noisy for auto-save/blur
    } else {
      toast.error('Gagal menyimpan');
    }
    setSavingId(null);
  };

  const renderParameterInput = (param: IParameter) => {
    const override = getOverride(param.id);
    const isWaterQuality = param.category === 'COOLING_WATER_QUALITY';

    if (param.valueType !== 'NUMBER') return null;

    return (
      <div key={param.id} className="mb-6 rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h4 className="font-medium">{param.name}</h4>
            <p className="text-xs text-muted-foreground">
              Default: {param.minValue ?? '-'} - {param.maxValue ?? '-'}{' '}
              {param.unit}
            </p>
          </div>
          {param.unit && (
            <span className="rounded bg-muted px-2 py-1 text-xs font-mono">
              {param.unit}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Min Value</Label>
            <Input
              type="number"
              step="any"
              placeholder={param.minValue?.toString() ?? 'Default'}
              defaultValue={override?.minValue ?? ''}
              onBlur={(e) => handleSave(param.id, 'minValue', e.target.value)}
              className={
                override?.minValue !== undefined && override?.minValue !== null
                  ? 'border-blue-500 bg-blue-50'
                  : ''
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Value</Label>
            <Input
              type="number"
              step="any"
              placeholder={param.maxValue?.toString() ?? 'Default'}
              defaultValue={override?.maxValue ?? ''}
              onBlur={(e) => handleSave(param.id, 'maxValue', e.target.value)}
              className={
                override?.maxValue !== undefined && override?.maxValue !== null
                  ? 'border-blue-500 bg-blue-50'
                  : ''
              }
            />
          </div>

          {isWaterQuality && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Raw Water Min</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder={param.rawWaterMinValue?.toString() ?? 'Default'}
                  defaultValue={override?.rawWaterMinValue ?? ''}
                  onBlur={(e) =>
                    handleSave(param.id, 'rawWaterMinValue', e.target.value)
                  }
                  className={
                    override?.rawWaterMinValue !== undefined &&
                    override?.rawWaterMinValue !== null
                      ? 'border-blue-500 bg-blue-50'
                      : ''
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Raw Water Max</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder={param.rawWaterMaxValue?.toString() ?? 'Default'}
                  defaultValue={override?.rawWaterMaxValue ?? ''}
                  onBlur={(e) =>
                    handleSave(param.id, 'rawWaterMaxValue', e.target.value)
                  }
                  className={
                    override?.rawWaterMaxValue !== undefined &&
                    override?.rawWaterMaxValue !== null
                      ? 'border-blue-500 bg-blue-50'
                      : ''
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Pengaturan Parameter Proyek</DialogTitle>
          <DialogDescription>
            Atur batas nilai (limit) khusus untuk proyek {project?.name}. Nilai
            yang kosong akan menggunakan default global.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="UNIT_CONDENSOR" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full justify-start overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              {CATEGORIES.map((cat) => (
                <TabsContent
                  key={cat.id}
                  value={cat.id}
                  className="h-full m-0"
                >
                  <ScrollArea className="h-[50vh] pr-4">
                    {parameters
                      .filter((p) => p.category === cat.id && p.isActive)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((param) => renderParameterInput(param))}
                    
                    {parameters.filter((p) => p.category === cat.id && p.isActive).length === 0 && (
                       <div className="text-center text-sm text-muted-foreground py-8">
                         Tidak ada parameter aktif di kategori ini.
                       </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
