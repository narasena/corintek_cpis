import { TChemicalAttributes } from '@/app/(main)/chemicals/schemas/chemicalSchema';
import { ITableHelper } from './base.dto';

export interface IChemical extends TChemicalAttributes, ITableHelper {}
