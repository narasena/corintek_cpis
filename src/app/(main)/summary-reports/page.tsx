'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProjectsAction } from '@/features/projects/actions';
import type { IProject } from '@/features/projects/types';
import {
  createSummaryReportAction,
  uploadSummaryReportAttachmentsAction,
} from '@/features/summary-reports/actions';

export default function SummaryReportsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  const [projectId, setProjectId] = useState<string>('');
  const [monthStr, setMonthStr] = useState<string>(''); // YYYY-MM
  const [notes, setNotes] = useState<string>('');
  const [sections, setSections] = useState({
    executive: true,
    logs: true,
    lab: true,
    work: true,
    chemical: true,
  });
  const [attachments, setAttachments] = useState<{
    dataTemuan: File | null;
    dataBlowdown: File | null;
    dataSuhu: File | null;
    dataSuratJalan: File | null;
  }>({
    dataTemuan: null,
    dataBlowdown: null,
    dataSuhu: null,
    dataSuratJalan: null,
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProjectsAction({});
      if (result.success && result.data) {
        setProjects(result.data as IProject[]);
      } else {
        toast.error('Gagal mengambil data proyek');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data proyek');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const canSubmit = useMemo(() => {
    return !!projectId && !!monthStr;
  }, [projectId, monthStr]);

  const hasAttachments = useMemo(() => {
    return Object.values(attachments).some(Boolean);
  }, [attachments]);

  const handleAttachmentChange =
    (key: keyof typeof attachments) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setAttachments(prev => ({ ...prev, [key]: file }));
    };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Lengkapi pilihan proyek dan periode');
      return;
    }

    const [year, month] = monthStr.split('-').map(Number);

    const form = new FormData();
    form.set('projectId', projectId);
    form.set('period', monthStr); // Send YYYY-MM directly
    if (notes) form.set('notes', notes);
    if (sections.executive) form.set('includeExecutiveSummary', 'true');
    if (sections.logs) form.set('includeLogSheets', 'true');
    if (sections.lab) form.set('includeLabAnalysis', 'true');
    if (sections.work) form.set('includeWorkReports', 'true');
    if (sections.chemical) form.set('includeChemicalReports', 'true');

    const res = await createSummaryReportAction(form);
    if ((res as any)?.error) {
      toast.error('Gagal membuat laporan ringkas', {
        description: (res as any).error,
      });
      return;
    }

    // Use local date for display to ensure correct month name
    const displayDate = new Date(year, month - 1, 1);

    toast.success('Berhasil menyiapkan laporan ringkas', {
      description: `Periode ${format(displayDate, 'MMMM yyyy', { locale: id })}`,
    });

    const periodLabel = `${year}-${String(month).padStart(2, '0')}`;

    if (hasAttachments) {
      const attachForm = new FormData();
      attachForm.set('projectId', projectId);
      attachForm.set('period', monthStr);
      if (attachments.dataTemuan)
        attachForm.set('dataTemuanFile', attachments.dataTemuan);
      if (attachments.dataBlowdown)
        attachForm.set('dataBlowdownFile', attachments.dataBlowdown);
      if (attachments.dataSuhu)
        attachForm.set('dataSuhuFile', attachments.dataSuhu);
      if (attachments.dataSuratJalan)
        attachForm.set('dataSuratJalanFile', attachments.dataSuratJalan);

      const uploadRes = await uploadSummaryReportAttachmentsAction(attachForm);
      if ((uploadRes as any)?.error) {
        toast.error('Gagal mengupload lampiran', {
          description: (uploadRes as any).error,
        });
      } else {
        toast.success('Lampiran tersimpan', {
          description: 'Lampiran siap dicetak terpisah',
        });
      }
    }

    router.push(`/summary-reports/${projectId}/${periodLabel}/print`);
  };

  const handleOpenAttachments = () => {
    if (!canSubmit) {
      toast.error('Lengkapi pilihan proyek dan periode');
      return;
    }
    const [year, month] = monthStr.split('-').map(Number);
    const periodLabel = `${year}-${String(month).padStart(2, '0')}`;
    router.push(
      `/summary-reports/${projectId}/${periodLabel}/attachments/print`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Ringkas</h1>
        <p className="text-muted-foreground mt-2">
          Pilih proyek dan periode (bulanan), lalu cetak laporan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Proyek</label>
            <Select
              value={projectId}
              onValueChange={v => setProjectId(v)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih proyek" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.client?.name ? `${p.client.name} — ` : ''}
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Periode</label>
            <Input
              type="month"
              value={monthStr}
              onChange={e => setMonthStr(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan</label>
            <Input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Opsional"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Bab yang disertakan</h2>
            <p className="text-muted-foreground text-sm">
              Pilih bagian yang ingin dimasukkan ke dalam laporan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={sections.executive}
                onCheckedChange={v =>
                  setSections(prev => ({ ...prev, executive: v === true }))
                }
              />
              Bab I — Executive Summary
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={sections.logs}
                onCheckedChange={v =>
                  setSections(prev => ({ ...prev, logs: v === true }))
                }
              />
              Bab II — Log Sheet Reports
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={sections.lab}
                onCheckedChange={v =>
                  setSections(prev => ({ ...prev, lab: v === true }))
                }
              />
              Bab III — Analisa Laboratorium
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={sections.work}
                onCheckedChange={v =>
                  setSections(prev => ({ ...prev, work: v === true }))
                }
              />
              Bab IV — Work Reports
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={sections.chemical}
                onCheckedChange={v =>
                  setSections(prev => ({ ...prev, chemical: v === true }))
                }
              />
              Bab V — Chemical Reports
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Lampiran Klien</h2>
        <p className="text-muted-foreground text-sm">
          PDF atau gambar akan dicetak terpisah pada Attachment Pack.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Temuan</label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleAttachmentChange('dataTemuan')}
            />
            {attachments.dataTemuan && (
              <p className="text-xs text-muted-foreground">
                {attachments.dataTemuan.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Blowdown Silang</label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleAttachmentChange('dataBlowdown')}
            />
            {attachments.dataBlowdown && (
              <p className="text-xs text-muted-foreground">
                {attachments.dataBlowdown.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Suhu</label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleAttachmentChange('dataSuhu')}
            />
            {attachments.dataSuhu && (
              <p className="text-xs text-muted-foreground">
                {attachments.dataSuhu.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Surat Jalan</label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleAttachmentChange('dataSuratJalan')}
            />
            {attachments.dataSuratJalan && (
              <p className="text-xs text-muted-foreground">
                {attachments.dataSuratJalan.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/reports')}>
          Batal
        </Button>
        <Button
          variant="outline"
          onClick={handleOpenAttachments}
          disabled={!canSubmit}
        >
          Cetak Lampiran
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          Buat & Cetak
        </Button>
      </div>
    </div>
  );
}
