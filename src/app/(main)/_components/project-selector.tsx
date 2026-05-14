'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getDashboardProjectsAction,
  getProjectsAction,
} from '@/features/projects/actions';
import { logger } from '@/lib/logger';

interface IProps {
  /** User's role string (e.g., 'ADMIN', 'SUPERVISOR', 'TECHNICIAN', etc.) */
  userRole: string;
}

interface IProjectOption {
  id: string;
  name: string;
}

const SCOPED_ROLES = [
  'SUPERVISOR',
  'TECHNICIAN',
  'CLIENT',
  'CLIENT_SUPERVISOR',
  'CLIENT_TECHNICIAN',
] as const;

export function ProjectSelector({ userRole }: IProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<IProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  const currentProjectId = searchParams.get('projectId');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const isScoped = SCOPED_ROLES.includes(
          userRole as (typeof SCOPED_ROLES)[number]
        );
        const res = isScoped
          ? await getDashboardProjectsAction({})
          : await getProjectsAction({});

        if (res.success && res.data) {
          const mapped = res.data.map(p => ({
            id: p.id,
            name: p.name,
          }));
          setProjects(mapped);
        } else {
          setProjects([]);
        }
      } catch (error) {
        logger.error(
          'ProjectSelector',
          'fetchProjects',
          error instanceof Error ? error.message : 'Unknown error'
        );
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userRole]);

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete('projectId');
    } else {
      params.set('projectId', value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const isDisabled = loading || projects.length === 0;

  return (
    <Select
      value={currentProjectId ?? 'ALL'}
      onValueChange={handleChange}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-[240px]" disabled={isDisabled}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : projects.length === 0 ? (
          <span>Tidak ada proyek</span>
        ) : (
          <SelectValue placeholder="Pilih Proyek" />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua Proyek</SelectItem>
        {projects.map(project => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
