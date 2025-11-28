import { UniqueIdentifier } from '@dnd-kit/core';
import axios from 'axios';

export default async function deleteData(id: UniqueIdentifier, apiUrl: string) {
  try {
    console.log('Try to delete id: ', id);
    const response = await axios.delete(`${apiUrl}/${id}`);
    console.log('Data with id: ', id, 'is deleted');
  } catch (error) {
    console.error(`Error deleting data with id: ${id}. Error stacks: `, error);
  }
}
