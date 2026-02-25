'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/multi-select';
import { getAllUsersAction } from '@/features/users/actions';
import {
  getProjectAssignmentsAction,
  setProjectAssignmentsAction,
} from '@/features/projects/actions';
import type { TUserResponse } from '@/@types/user.type';
import type { TProjectAssignmentRole } from '@/features/projects/types';

interface ProjectAssignmentsSectionProps {
  mode: 'create' | 'edit';
  projectId?: string;
}

export function ProjectAssignmentsSection({
  mode,
  projectId,
}: ProjectAssignmentsSectionProps) {
  const [isAssignmentPending, startAssignmentTransition] = useTransition();
  const [users, setUsers] = useState<TUserResponse[]>([]);
  const [projectPicUserId, setProjectPicUserId] = useState<string>('none');
  const [clientPicUserId, setClientPicUserId] = useState<string>('none');
  const [technicianUserIds, setTechnicianUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!projectId) return;

    (async () => {
      const [usersRes, assignmentsRes] = await Promise.all([
        getAllUsersAction(),
        getProjectAssignmentsAction(projectId),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      } else {
        toast.error(usersRes.error || 'Gagal mengambil data pengguna');
      }

      if (assignmentsRes.success && assignmentsRes.data) {
        const assignments = assignmentsRes.data as Array<{
          userId: string;
          role: TProjectAssignmentRole;
        }>;

        setProjectPicUserId(
          assignments.find(a => a.role === 'PROJECT_PIC')?.userId ?? 'none'
        );
        setClientPicUserId(
          assignments.find(a => a.role === 'CLIENT_PIC')?.userId ?? 'none'
        );
        setTechnicianUserIds(
          assignments.filter(a => a.role === 'TECHNICIAN').map(a => a.userId)
        );
      } else {
        toast.error(assignmentsRes.error || 'Gagal mengambil data penugasan');
      }
    })();
  }, [mode, projectId]);

  const activeUsers = useMemo(
    () => users.filter(u => u.isActive && !u.isBlocked && !u.deletedAt),
    [users]
  );

  const projectPicOptions = useMemo(
    () =>
      activeUsers
        .filter(u => u.role === 'SUPERVISOR')
        .map(u => ({
          label: `${u.firstName} ${u.lastName || ''}`.trim(),
          value: u.id,
        })),
    [activeUsers]
  );

  const clientPicOptions = useMemo(
    () =>
      activeUsers
        .filter(u => u.role === 'CLIENT_SUPERVISOR')
        .map(u => ({
          label: `${u.firstName} ${u.lastName || ''}`.trim(),
          value: u.id,
        })),
    [activeUsers]
  );

  const technicianOptions = useMemo(
    () =>
      activeUsers
        .filter(u => u.role === 'TECHNICIAN' || u.role === 'CLIENT_TECHNICIAN')
        .map(u => ({
          label: `${u.firstName} ${u.lastName || ''}`.trim(),
          value: u.id,
        })),
    [activeUsers]
  );

  const saveAssignments = () => {
    if (mode !== 'edit') return;
    if (!projectId) {
      toast.error('ID proyek tidak ditemukan');
      return;
    }

    startAssignmentTransition(async () => {
      const assignments: Array<{
        userId: string;
        role: TProjectAssignmentRole;
      }> = [];

      if (projectPicUserId !== 'none') {
        assignments.push({ userId: projectPicUserId, role: 'PROJECT_PIC' });
      }

      for (const userId of technicianUserIds) {
        assignments.push({ userId, role: 'TECHNICIAN' });
      }

      if (clientPicUserId !== 'none') {
        assignments.push({ userId: clientPicUserId, role: 'CLIENT_PIC' });
      }

      const result = await setProjectAssignmentsAction({
        projectId,
        assignments,
      });

      if (result.success) {
        toast.success('Penugasan berhasil disimpan');
      } else {
        toast.error(result.error || 'Gagal menyimpan penugasan');
      }
    });
  };

  if (mode !== 'edit' || !projectId) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-semibold text-lg border-b pb-2">Penugasan</h3>

      <div className="space-y-2">
        <FormLabel>PIC Project</FormLabel>
        <Select value={projectPicUserId} onValueChange={setProjectPicUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih PIC Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">- Tidak Ada -</SelectItem>
            {projectPicOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <FormLabel>Teknisi</FormLabel>
        <MultiSelect
          options={technicianOptions}
          selected={technicianUserIds}
          onChange={setTechnicianUserIds}
          placeholder="Pilih teknisi..."
        />
      </div>

      <div className="space-y-2">
        <FormLabel>PIC Klien</FormLabel>
        <Select value={clientPicUserId} onValueChange={setClientPicUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih PIC Klien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">- Tidak Ada -</SelectItem>
            {clientPicOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={isAssignmentPending}
        onClick={saveAssignments}
      >
        {isAssignmentPending ? 'Menyimpan...' : 'Simpan Penugasan'}
      </Button>
    </div>
  );
}
