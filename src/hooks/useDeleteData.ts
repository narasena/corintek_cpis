import apiInstance from '@/utils/apiInstance';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useState } from 'react';
import { toast } from 'sonner';

export default function useDeleteData(
  id: UniqueIdentifier,
  apiUrl: string,
  refreshData?: () => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const handleDeleteData = async () => {
    try {
      setIsLoading(true);
      console.log('Try to delete id: ', id);
      const response = await apiInstance.delete(`${apiUrl}/${id}`);
      toast.success(response.data.message);
      console.log('Data with id: ', id, 'is deleted');
      setIsLoading(false);
      refreshData?.();
    } catch (error) {
      console.error(
        `Error deleting data with id: ${id}. Error stacks: `,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isLoading,
    handleDeleteData,
  };
}
