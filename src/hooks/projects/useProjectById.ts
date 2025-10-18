import { IProject } from '@/types/project.type';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useEffect, useState } from 'react';

export default function useProjectById(projectId: string) {
  const [project, setProject] = useState<IProject | null>(null);
  const fetchProjectById = async () => {
    try {
      const response = await apiInstance.get(`/projects/${projectId}`);
      setProject(response.data.project);
    } catch (err) {
      errorMessageResponse(err);
    }
  };
  useEffect(() => {
    if (!projectId) return;
    fetchProjectById();
  }, [projectId]);
  return { project, refetch: fetchProjectById };
}
