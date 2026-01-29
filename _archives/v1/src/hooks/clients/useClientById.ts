import { IClient } from '@/types/client.type';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function useClientById(clientId: string) {
  const [clientData, setClientData] = useState<IClient>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get(`/clients/${clientId}`);
      setClientData(response.data.client);
    } catch (error) {
      console.error('❌ Error fetching client data:', error);
      toast.error(errorMessageResponse(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      setClientData(undefined);
      setIsLoading(false);
      return;
    }
    fetchClientData();
  }, [clientId]);

  return {
    clientData,
    isLoading,
    refetch: fetchClientData,
  };
}
