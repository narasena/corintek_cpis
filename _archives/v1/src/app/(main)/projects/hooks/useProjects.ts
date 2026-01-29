import { useState, useEffect } from 'react';
import { IProject } from '@/types/project.type';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';

export default function useProjects() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiInstance.get('/projects');

      setProjects(response.data.projects);
    } catch (err) {
      errorMessageResponse(err, 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetchProjects: fetchProjects,
  };
}
