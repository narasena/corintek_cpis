import useAllClients from '@/hooks/clients/useAllClients';
import useClientById from '@/hooks/clients/useClientById';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useState } from 'react';

export default function useClients() {
  const [clientId, setClientId] = useState<UniqueIdentifier>();
  const { allClients, loading, error, refetch } = useAllClients();
  const { clientData, isLoading: isLoadingClientById } = useClientById(
    clientId ? String(clientId) : ''
  );
  const handleClickClientData = (newClientId: UniqueIdentifier) => {
    console.log('🔄 Client clicked, ID:', newClientId);
    if (newClientId === clientData?.id) {
      setClientId(undefined);
      return;
    }
    setClientId(newClientId);
  };
  return {
    allClients,
    clientData,
    isLoading: loading,
    isLoadingClientById,
    error,
    refetch,
    handleClickClientData,
  };
}
