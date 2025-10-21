import { IChemical } from '@/types/chemical.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllChemicals() {
  const [allChemicals, setAllChemicals] = useState<IChemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAllChemicals = async () => {
    try {
      setLoading(true);
      const response = await apiInstance.get('/chemicals');
      setAllChemicals(response.data.chemicals);
      setLoading(false);
    } catch (error) {
      setError(errorMessageResponse(error));
      errorMessageResponse(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllChemicals();
  }, []);
  return {
    allChemicals,
    loading,
    error,
    refetchAllChemicals: fetchAllChemicals,
  };
}
