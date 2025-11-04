import { ILogSheet } from '@/types/log-sheet.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useLogSheetDetails(logSheetId: string) {
  const [logSheetDetails, setLogSheetDetails] = useState<ILogSheet | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const fetchLogSheetDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get(`/log-sheets/${logSheetId}`);
      setLogSheetDetails(response.data.logSheetDetails);
      setIsLoading(false);
    } catch (error) {
      errorMessageResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (logSheetId) {
      fetchLogSheetDetails();
    }
  }, [logSheetId]);
  return {
    logSheetDetails,
    isLoading,
    refetchLogSheetDetails: fetchLogSheetDetails,
  };
}
