import { IParameter } from '@/types/parameter.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllParameters() {
  const [allParameters, setAllParameters] = useState<IParameter[]>([]);
  const fetchAllParameters = async () => {
    try {
      const response = await apiInstance.get('/parameters');
      setAllParameters(response.data.parameters);
    } catch (error) {
      errorMessageResponse(error);
    }
  };
  useEffect(() => {
    fetchAllParameters();
  }, []);

  return {
    allParameters,
    refetchAllParameters: fetchAllParameters,
  };
}
