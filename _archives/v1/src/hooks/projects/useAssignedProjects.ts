import { useAuthStore } from '@/stores/authStore';
import { IProject } from '@/types/project.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useAssignedProjects() {
  const { user } = useAuthStore();
  const [assignedProjects, setAssignedProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignedProjects = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get('/projects/me');
      setAssignedProjects(response.data.projects);
      setIsLoading(false);
    } catch (error) {
      errorMessageResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.id) {
      fetchAssignedProjects();
    }
  }, [user]);
  return {
    assignedProjects,
    refetchAssignedProjects: fetchAssignedProjects,
    isLoading,
  };
}
