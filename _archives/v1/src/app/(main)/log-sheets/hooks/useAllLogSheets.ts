import { ILogSheet } from '@/types/log-sheet.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllLogSheets(projectId: string) {
  const [logSheets, setLogSheets] = useState<ILogSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchAllLogSheets = async () => {
    try {
      setLoading(true);
      const response = await apiInstance.get(
        `/projects/${projectId}/log-sheets`
      );
      console.log(response.data.logSheets);
      setLogSheets(response.data.logSheets);
      setLoading(false);
    } catch (error) {
      errorMessageResponse(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (projectId) {
      fetchAllLogSheets();
    }
  }, [projectId]);
  return {
    logSheets,
    loading,
    refetchLogSheets: fetchAllLogSheets,
  };
}
