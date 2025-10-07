import { IPersonnelGroup } from '@/types/project.type';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAllPersonnels() {
  const [internalPersonnels, setInternalPersonnels] = useState<
    IPersonnelGroup[]
  >([]);

  const fetchPersonnels = async () => {
    try {
      const response = await apiInstance.get('/projects/personnels/internals');
      console.log(response.data);
      setInternalPersonnels(response.data.personnels);
    } catch (error) {
      console.error('❌ Error fetching personnels:', error);
    }
  };

  useEffect(() => {
    fetchPersonnels();
  }, []);

  return {
    internalPersonnels,
  };
}
