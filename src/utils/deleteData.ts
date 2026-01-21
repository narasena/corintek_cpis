import { UniqueIdentifier } from '@dnd-kit/core';
import axios from 'axios';

export default async function deleteData(id: UniqueIdentifier, apiUrl: string) {
  try {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${apiUrl}/${id}`);
  } catch (error) {
    console.error(`Error deleting data with id: ${id}. Error stacks: `, error);
  }
}
