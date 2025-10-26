import { ParameterGroupType } from '@/features/api/generated/prisma/index-browser';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useLogSheetSchemaParameters() {
  const [logSheetSchemaParameters, setLogSheetSchemaParameters] =
    useState<unknown>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchLogSheetSchemaParameters = async () => {
    try {
      const response = await apiInstance.get(
        `/parameters/group-types/${ParameterGroupType.LOG_SHEET}`
      );
      setLogSheetSchemaParameters(response.data.parameters);
      setIsLoadingData(false);
    } catch (error) {
      errorMessageResponse(error);
    }
  };

  useEffect(() => {
    fetchLogSheetSchemaParameters();
  }, []);

  return { logSheetSchemaParameters, isLoadingData };
}
