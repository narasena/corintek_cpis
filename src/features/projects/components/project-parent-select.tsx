'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  IProjectParentSelectProps,
  TProjectType,
} from '@/features/projects/types';
import { getProjectsAction } from '@/features/projects/actions';

interface TParentOption {
  id: string;
  name: string;
}

async function fetchParentProjects(clientId: string): Promise<TParentOption[]> {
  const res = await getProjectsAction();
  if (!res.success) {
    throw new Error(res.error || 'Gagal mengambil project utama');
  }

  const projects = res.data as unknown as Array<{
    id: string;
    name: string;
    clientId: string;
    projectType: TProjectType;
  }>;

  return projects
    .filter(p => p.projectType === 'UTAMA' && p.clientId === clientId)
    .map(p => ({ id: p.id, name: p.name }));
}

export function ProjectParentSelect({
  projectType,
  clientId,
  value,
  onChange,
  disabled,
}: IProjectParentSelectProps) {
  const [options, setOptions] = useState<TParentOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectType !== 'ADDENDUM' || !clientId) {
      setOptions([]);
      onChange(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const parents = await fetchParentProjects(clientId);
        if (!cancelled) {
          setOptions(parents);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil project utama'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [projectType, clientId, onChange]);

  if (projectType !== 'ADDENDUM') {
    return null;
  }

  return (
    <Select
      value={value ?? ''}
      onValueChange={val => onChange(val || null)}
      disabled={disabled || !clientId || loading}
    >
      <SelectTrigger>
        <SelectValue placeholder="Pilih project utama" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.id} value={opt.id}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
