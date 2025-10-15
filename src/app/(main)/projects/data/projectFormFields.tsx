import {
  ContractType,
  ProjectType,
  WorkCategory,
} from '@/features/api/generated/prisma';
import {
  EFieldType,
  IFormFields,
  ISelectDataFormField,
} from '@/types/form/form.type';
import { IPersonnelGroup } from '@/types/project.type';
import { SelectPersonnel } from '../components/select-personnel';
import React from 'react';
import { SelectClientPersonnel } from '../components/select-client-personnel';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { IClientPersonnel } from '@/types/client.type';
import enumOptions from '@/utils/enumOptions';

interface IProjectCreationFormFields {
  clients: ISelectDataFormField[];
  personnel: IPersonnelGroup[];
  clientPersonnel: IClientPersonnel[];
}
export const projectCreationFormFields = (
  selectData: IProjectCreationFormFields
) => {
  return [
    {
      name: 'clientId',
      label: 'Klien',
      type: EFieldType.SELECT,
      placeHolder: '',
      description: '',
      selectData: selectData.clients,
    },
    {
      name: 'name',
      label: 'Nama Proyek',
      type: EFieldType.TEXT,
      placeHolder: '',
      description: '',
      className: 'col-span-2',
    },
    {
      name: 'description',
      label: 'Deskripsi',
      type: EFieldType.TEXTAREA,
      placeHolder: '',
      description: '',
      className: 'col-span-2',
    },
    {
      name: 'quoteNumber',
      label: 'Nomor Kuota',
      type: EFieldType.TEXT,
      placeHolder: '',
      description: '',
    },
    {
      name: 'PONumber',
      label: 'Nomor PO',
      type: EFieldType.TEXT,
      placeHolder: '',
      description: '',
    },
    {
      name: 'startDate',
      label: 'Tanggal Mulai',
      type: EFieldType.DATE,
      placeHolder: '',
      description: '',
    },
    {
      name: 'endDate',
      label: 'Tanggal Selesai',
      type: EFieldType.DATE,
      placeHolder: '',
      description: '',
    },
    {
      name: 'type',
      label: 'Jenis Proyek',
      type: EFieldType.ENUM,
      placeHolder: '',
      description: '',
      enumOptions: enumOptions(ProjectType),
    },
    {
      name: 'contractType',
      label: 'Jenis Kontrak',
      type: EFieldType.ENUM,
      placeHolder: '',
      description: '',
      enumOptions: enumOptions(ContractType),
    },
    {
      name: 'workCategory',
      label: 'Kategori Kerja',
      type: EFieldType.ENUM,
      placeHolder: '',
      description: '',
      enumOptions: enumOptions(WorkCategory),
    },
    {
      name: 'warranty',
      label: 'Garansi',
      type: EFieldType.NUMBER,
      placeHolder: '',
      description: '',
    },
    {
      name: 'clientPersonnelIds',
      label: 'PIC Klien',
      type: EFieldType.CUSTOM,
      placeHolder: '',
      description: '',
      customComponent: (
        field: ControllerRenderProps<FieldValues, Path<FieldValues>>
      ) =>
        React.createElement(SelectClientPersonnel, {
          field,
          data: selectData.clientPersonnel,
        }),
    },
    {
      name: 'personnelIds',
      label: 'PIC Corintek',
      type: EFieldType.CUSTOM,
      placeHolder: '',
      description: '',
      customComponent: (
        field: ControllerRenderProps<FieldValues, Path<FieldValues>>
      ) =>
        React.createElement(SelectPersonnel, {
          field,
          dataGroup: selectData.personnel,
        }),
    },
    {
      name: 'parentId',
      label: 'Proyek Sebelumnya',
      type: EFieldType.SELECT,
      placeHolder: '',
      description: '',
    },
  ] as IFormFields[];
};
