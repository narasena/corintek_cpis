import { IPersonnelGroup } from '@/types/project.type';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllPersonnel() {
  const [internalPersonnel, setInternalPersonnel] = useState<IPersonnelGroup[]>(
    []
  );

  const fetchPersonnel = async () => {
    try {
      const response = await apiInstance.get('/projects/personnel');
      setInternalPersonnel(response.data.personnel);
    } catch (error) {
      console.error('❌ Error fetching personnel:', error);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  return {
    internalPersonnel,
  };
}
