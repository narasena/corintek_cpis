import { IParameterLimit } from '@/types/parameter.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllParameterLimits() {
  const [allParameterLimits, setAllParameterLimits] = useState<
    IParameterLimit[]
  >([]);
  const fetchAllParameterLimits = async () => {
    try {
      const response = await apiInstance.get('/parameters/limits');
      setAllParameterLimits(response.data.parameterLimits);
    } catch (error) {
      errorMessageResponse(error);
    }
  };
  useEffect(() => {
    fetchAllParameterLimits();
  }, []);
  return {
    allParameterLimits,
    refetchAllParameterLimits: fetchAllParameterLimits,
  };
}
