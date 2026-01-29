import { IProject } from '@/types/project.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useProjectById(projectId: string) {
  const [project, setProject] = useState<IProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectById = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get(`/projects/${projectId}`);
      setProject(response.data.project);
      setIsLoading(false);
    } catch (err) {
      errorMessageResponse(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!projectId) return;
    fetchProjectById();
  }, [projectId]);
  return { project, refetch: fetchProjectById, isLoading };
}
