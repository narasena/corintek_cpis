import { IParameterGroup } from '@/types/parameter.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useParameterGroupById(parameterGroupId: string) {
  const [parameterGroup, setParameterGroup] = useState<IParameterGroup | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchParameterGroupById = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get(
        `/parameters/groups/${parameterGroupId}`
      );
      setParameterGroup(response.data.parameterGroup);
      setIsLoading(false);
    } catch (error) {
      errorMessageResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParameterGroupById();
  }, [parameterGroupId]);

  return { parameterGroup, isLoading };
}
