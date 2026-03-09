'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Search, X } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { getAllLogSheetsAction } from '@/features/log-sheets/actions';
import type { IGlobalLogSheetListItem } from '@/features/log-sheets/service';
import { columns } from './components/columns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const [data, setData] = useState<IGlobalLogSheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllLogSheetsAction({});
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error('Gagal mengambil data laporan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = search.toLowerCase();
      const clientName = item.project.client?.name?.toLowerCase() || '';
      const projectName = item.project.name.toLowerCase();

      const matchSearch =
        !search ||
        clientName.includes(searchLower) ||
        projectName.includes(searchLower);

      const matchDate =
        !dateFilter ||
        new Date(item.date).toISOString().split('T')[0] === dateFilter;

      return matchSearch && matchDate;
    });
  }, [data, search, dateFilter]);

  const clearFilters = () => {
    setSearch('');
    setDateFilter('');
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground mt-2">
            Daftar semua log sheet dari seluruh proyek.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari Client / Project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-full md:w-auto">
          <Input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-full md:w-[180px]"
          />
        </div>
        {(search || dateFilter) && (
          <Button variant="ghost" onClick={clearFilters} className="h-10 px-3">
            <X className="mr-2 h-4 w-4" />
            Reset Filter
          </Button>
        )}
      </div>

      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          emptyMessage="Belum ada laporan yang sesuai filter."
        />
      )}
    </div>
  );
}
