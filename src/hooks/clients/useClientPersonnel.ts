import { useEffect, useState } from 'react';
import apiInstance from '@/utils/apiInstance';
import { IClientPersonnel } from '@/types/client.type';

export default function useClientPersonnel(clientId: string | null) {
  const [clientPersonnel, setClientPersonnel] = useState<IClientPersonnel[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setClientPersonnel([]);
      return;
    }

    const fetchClientPersonnel = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiInstance.get(
          `/clients/${clientId}/personnel`
        );
        if (response.data.success) {
          setClientPersonnel(response.data.clientPersonnel || []);
        } else {
          setError('Failed to fetch client personnel');
        }
      } catch (err) {
        setError('Error fetching client personnel');
        console.error('Error fetching client personnel:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientPersonnel();
  }, [clientId]);

  return {
    clientPersonnel,
    loading,
    error,
  };
}
