import { UniqueIdentifier } from '@dnd-kit/core';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

export default function useDeleteData() {
  const [isLoading, setIsLoading] = useState(false);
  const deleteDataHandler = async (id: UniqueIdentifier, apiUrl: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${apiUrl}/${id}`);
      toast.success('Data deleted successfully');
      setIsLoading(false);
    } catch (error) {
      toast.error('Error deleting data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isLoading,
    deleteDataHandler,
  };
}
