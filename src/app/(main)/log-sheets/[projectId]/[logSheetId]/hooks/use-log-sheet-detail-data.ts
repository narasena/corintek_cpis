import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getLogSheetDetailAction } from '@/features/log-sheets/actions';
import type { TDetail } from '../types';

export function useLogSheetDetailData(logSheetId: string) {
  const [detail, setDetail] = useState<TDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLogSheetDetailAction(logSheetId);
      if (!result.success || !result.data) {
        toast.error('Gagal mengambil detail log sheet', {
          description: result.error,
        });
        return;
      }
      setDetail(result.data as unknown as TDetail);
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [logSheetId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { detail, loading, reload };
}
