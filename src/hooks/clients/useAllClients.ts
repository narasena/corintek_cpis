import { IClient } from '@/types/client.type';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function useAllClients() {
  const [allClients, setAllClients] = useState<IClient[]>([]);

  const fetchClients = async () => {
    try {
      const response = await apiInstance.get('/clients');
      setAllClients(response.data.clients);
    } catch (error) {
      toast.error(errorMessageResponse(error));
      console.error('Submit error:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { allClients };
}
