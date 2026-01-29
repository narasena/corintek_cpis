import { IClient } from '@/types/client.type';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function useAllClients() {
  const [allClients, setAllClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiInstance.get('/clients');
      setAllClients(response.data.clients);
    } catch (error) {
      const errorMessage = errorMessageResponse(error);
      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { allClients, loading, error, refetch: fetchClients };
}
