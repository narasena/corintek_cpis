import { IProject } from '@/types/project.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useProjectsByClient(clientId: string) {
  const [clientProjects, setClientProjects] = useState<IProject[]>([]);

  const fetchProjectsByClient = async () => {
    try {
      const response = await apiInstance.get(`/clients/${clientId}/projects`);
      setClientProjects(response.data.clientProjects);
    } catch (error) {
      errorMessageResponse(error);
    }
  };

  useEffect(() => {
    if (!clientId) return;
    fetchProjectsByClient();
  }, [clientId]);

  return { clientProjects, fetchProjectsByClient };
}
