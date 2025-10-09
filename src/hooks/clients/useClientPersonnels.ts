import { useEffect, useState } from 'react';
import apiInstance from '@/utils/apiInstance';
import { IClientPersonnel } from '@/types/client.type';

export default function useClientPersonnels(clientId: string | null) {
  const [clientPersonnels, setClientPersonnels] = useState<IClientPersonnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setClientPersonnels([]);
      return;
    }

    const fetchClientPersonnels = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiInstance.get(`/clients/${clientId}/personnels`);
        if (response.data.success) {
          setClientPersonnels(response.data.clientPersonnel || []);
        } else {
          setError('Failed to fetch client personnels');
        }
      } catch (err) {
        setError('Error fetching client personnels');
        console.error('Error fetching client personnels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientPersonnels();
  }, [clientId]);

  return {
    clientPersonnels,
    loading,
    error,
  };
}
