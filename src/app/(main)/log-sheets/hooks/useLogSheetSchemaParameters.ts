import { ParameterGroupType } from '@/features/api/generated/prisma/enums';
import { IGroupParameterByType } from '@/types/parameter.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useLogSheetSchemaParameters() {
  const [logSheetSchemaParameters, setLogSheetSchemaParameters] = useState<
    IGroupParameterByType[]
  >([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchLogSheetSchemaParameters = async () => {
    try {
      setIsLoadingData(true);
      const response = await apiInstance.get(
        `/parameters/group-types/${ParameterGroupType.LOG_SHEET}`
      );
      setLogSheetSchemaParameters(response.data.groupParameters);
      setIsLoadingData(false);
    } catch (error) {
      errorMessageResponse(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLogSheetSchemaParameters();
  }, []);

  return { logSheetSchemaParameters, isLoadingData };
}
