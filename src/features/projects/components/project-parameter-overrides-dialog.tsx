'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, Settings2, Save, Undo } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { IProject } from '../types';
import { upsertProjectParameterOverrideAction } from '../actions';
import { getParametersAction } from '@/features/parameters/actions';
import { IParameter } from '@/features/parameters/types';

interface ProjectParameterOverridesDialogProps {
  project: IProject;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'UNIT_CONDENSOR', label: 'Condensor' },
  { value: 'UNIT_EVAPORATOR', label: 'Evaporator' },
  { value: 'COOLING_WATER_QUALITY', label: 'CW Quality' },
  { value: 'GENERAL_CONDITION', label: 'General' },
  { value: 'JOB_DESCRIPTION', label: 'Job Desc' },
  { value: 'CONSUMPTION', label: 'Consumption' },
  { value: 'LAB_ANALYSIS', label: 'Lab Analysis' },
];

export function ProjectParameterOverridesDialog({
  project,
  trigger,
  open,
  onOpenChange,
}: ProjectParameterOverridesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [parameters, setParameters] = useState<IParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('UNIT_CONDENSOR');

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (newOpen && parameters.length === 0) {
      fetchParameters();
    }
  };

  const fetchParameters = async () => {
    setLoading(true);
    try {
      const result = await getParametersAction({});
      if (result.success && result.data) {
        setParameters(result.data);
      } else {
        toast.error('Gagal mengambil data parameter');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengambil data parameter');
    } finally {
      setLoading(false);
    }
  };

  const overridesMap = React.useMemo(() => {
    const map = new Map();
    project.parameterOverrides?.forEach(o => {
      map.set(o.parameterId, o);
    });
    return map;
  }, [project.parameterOverrides]);

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" title="Atur Batas Parameter">
            <Settings2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader
          className="p-6 pb-2 -mx-6 -mt-6 px-6 py-4 rounded-t-lg"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          <DialogTitle className="text-white">
            Override Batas Parameter
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Atur batas minimum dan maksimum khusus untuk proyek{' '}
            <strong>{project.name}</strong>. Kosongkan untuk mengikuti standar
            global.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="mb-4 flex flex-wrap h-auto gap-2 justify-start">
                {CATEGORIES.map(cat => (
                  <TabsTrigger key={cat.value} value={cat.value}>
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-hidden border rounded-md">
                <ScrollArea className="h-full">
                  {CATEGORIES.map(cat => (
                    <TabsContent
                      key={cat.value}
                      value={cat.value}
                      className="m-0 border-0"
                    >
                      <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                          <TableRow>
                            <TableHead className="w-[200px]">
                              Parameter
                            </TableHead>
                            <TableHead className="w-[100px]">Unit</TableHead>
                            <TableHead className="w-[100px] text-center bg-blue-50/50">
                              Min (Global)
                            </TableHead>
                            <TableHead className="w-[100px] text-center bg-blue-50/50">
                              Max (Global)
                            </TableHead>
                            <TableHead className="w-[100px] text-center bg-amber-50/50">
                              Ovr Min
                            </TableHead>
                            <TableHead className="w-[100px] text-center bg-amber-50/50">
                              Ovr Max
                            </TableHead>
                            <TableHead className="w-[100px] text-center bg-cyan-50/50">
                              Raw Min
                            </TableHead>
                            <TableHead className="w-[100px] text-center bg-cyan-50/50">
                              Raw Max
                            </TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parameters
                            .filter(
                              p =>
                                p.category === cat.value &&
                                p.valueType === 'NUMBER'
                            )
                            .map(param => (
                              <ParameterRow
                                key={param.id}
                                parameter={param}
                                projectId={project.id}
                                override={overridesMap.get(param.id)}
                              />
                            ))}
                          {parameters.filter(
                            p =>
                              p.category === cat.value &&
                              p.valueType === 'NUMBER'
                          ).length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="h-24 text-center"
                              >
                                Tidak ada parameter numerik di kategori ini.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  ))}
                </ScrollArea>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ParameterRow({
  parameter,
  projectId,
  override,
}: {
  parameter: IParameter;
  projectId: string;
  override?: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [minVal, setMinVal] = useState<string>(
    override?.minValue?.toString() ?? ''
  );
  const [maxVal, setMaxVal] = useState<string>(
    override?.maxValue?.toString() ?? ''
  );
  const [rawMinVal, setRawMinVal] = useState<string>(
    override?.rawWaterMinValue?.toString() ?? ''
  );
  const [rawMaxVal, setRawMaxVal] = useState<string>(
    override?.rawWaterMaxValue?.toString() ?? ''
  );

  // Update local state when override changes (e.g. after save)
  useEffect(() => {
    setMinVal(override?.minValue?.toString() ?? '');
    setMaxVal(override?.maxValue?.toString() ?? '');
    setRawMinVal(override?.rawWaterMinValue?.toString() ?? '');
    setRawMaxVal(override?.rawWaterMaxValue?.toString() ?? '');
  }, [override]);

  const hasChanges =
    minVal !== (override?.minValue?.toString() ?? '') ||
    maxVal !== (override?.maxValue?.toString() ?? '') ||
    rawMinVal !== (override?.rawWaterMinValue?.toString() ?? '') ||
    rawMaxVal !== (override?.rawWaterMaxValue?.toString() ?? '');

  const handleSave = () => {
    const minValue = minVal === '' ? null : Number(minVal);
    const maxValue = maxVal === '' ? null : Number(maxVal);
    const rawWaterMinValue = rawMinVal === '' ? null : Number(rawMinVal);
    const rawWaterMaxValue = rawMaxVal === '' ? null : Number(rawMaxVal);

    if (minVal !== '' && isNaN(Number(minVal))) {
      toast.error('Nilai minimum harus berupa angka');
      return;
    }
    if (maxVal !== '' && isNaN(Number(maxVal))) {
      toast.error('Nilai maksimum harus berupa angka');
      return;
    }
    if (rawMinVal !== '' && isNaN(Number(rawMinVal))) {
      toast.error('Nilai raw min harus berupa angka');
      return;
    }
    if (rawMaxVal !== '' && isNaN(Number(rawMaxVal))) {
      toast.error('Nilai raw max harus berupa angka');
      return;
    }

    startTransition(async () => {
      const result = await upsertProjectParameterOverrideAction({
        projectId,
        parameterId: parameter.id,
        minValue,
        maxValue,
        rawWaterMinValue,
        rawWaterMaxValue,
      });

      if (result.success) {
        toast.success(`Override ${parameter.name} disimpan`);
      } else {
        toast.error(`Gagal menyimpan: ${result.error}`);
      }
    });
  };

  const handleReset = () => {
    setMinVal(override?.minValue?.toString() ?? '');
    setMaxVal(override?.maxValue?.toString() ?? '');
    setRawMinVal(override?.rawWaterMinValue?.toString() ?? '');
    setRawMaxVal(override?.rawWaterMaxValue?.toString() ?? '');
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {parameter.name}
        <div className="text-xs text-muted-foreground">
          {parameter.variableName}
        </div>
      </TableCell>
      <TableCell>{parameter.unit || '-'}</TableCell>
      <TableCell className="text-center text-muted-foreground bg-blue-50/30">
        {parameter.minValue ?? '-'}
      </TableCell>
      <TableCell className="text-center text-muted-foreground bg-blue-50/30">
        {parameter.maxValue ?? '-'}
      </TableCell>
      <TableCell className="bg-amber-50/30">
        <Input
          type="number"
          step="any"
          value={minVal}
          onChange={e => setMinVal(e.target.value)}
          placeholder={parameter.minValue?.toString() ?? 'Global'}
          className="h-8 text-center"
        />
      </TableCell>
      <TableCell className="bg-amber-50/30">
        <Input
          type="number"
          step="any"
          value={maxVal}
          onChange={e => setMaxVal(e.target.value)}
          placeholder={parameter.maxValue?.toString() ?? 'Global'}
          className="h-8 text-center"
        />
      </TableCell>
      <TableCell className="bg-cyan-50/30">
        <Input
          type="number"
          step="any"
          value={rawMinVal}
          onChange={e => setRawMinVal(e.target.value)}
          placeholder={parameter.rawWaterMinValue?.toString() ?? 'Global'}
          className="h-8 text-center"
        />
      </TableCell>
      <TableCell className="bg-cyan-50/30">
        <Input
          type="number"
          step="any"
          value={rawMaxVal}
          onChange={e => setRawMaxVal(e.target.value)}
          placeholder={parameter.rawWaterMaxValue?.toString() ?? 'Global'}
          className="h-8 text-center"
        />
      </TableCell>
      <TableCell>
        {hasChanges && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleReset}
              disabled={isPending}
            >
              <Undo className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
