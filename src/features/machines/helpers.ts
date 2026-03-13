import { TMachineType, TCreateMachine } from './types';

/**
 * Factory to create a default machine object for forms
 */
export function createDefaultMachine(
  type: TMachineType,
  unitNumber: number,
  projectId: string = ''
): TCreateMachine {
  return {
    projectId,
    unitNumber,
    type,
    ownership: 'CLIENT',
    status: 'IDLE',
    capacity: null,
    brand: null,
    model: null,
    serialNumber: null,
  };
}
