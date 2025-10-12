import { IStandardMethod } from '@/types/parameter.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllStandardMethods() {
  const [allStandardMethods, setAllStandardMethods] = useState<
    IStandardMethod[]
  >([]);

  const fetchStandardMethods = async () => {
    try {
      const response = await apiInstance.get('/parameters/standard-methods');
      setAllStandardMethods(response.data.standardMethods);
    } catch (error) {
      errorMessageResponse(error);
    }
  };

  useEffect(() => {
    fetchStandardMethods();
  }, []);

  return {
    allStandardMethods,
    refetchStandardMethods: fetchStandardMethods,
  };
}
