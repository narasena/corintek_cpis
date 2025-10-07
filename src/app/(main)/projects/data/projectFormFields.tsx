import {
  ContractType,
  ProjectType,
  WorkCategory,
} from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import { IPersonnelGroup } from '@/types/project.type';
import { SelectPersonnels } from '../components/select-personnels';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import React from 'react';

export const projectCreationFormFields = (data: IPersonnelGroup[]) => {
  return [
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
      enumOptions: Object.keys(ProjectType).map(
        key => ProjectType[key as keyof typeof ProjectType]
      ) as string[],
    },
    {
      name: 'contractType',
      label: 'Jenis Kontrak',
      type: EFieldType.ENUM,
      placeHolder: '',
      description: '',
      enumOptions: Object.keys(ContractType).map(
        key => ContractType[key as keyof typeof ContractType]
      ) as string[],
    },
    {
      name: 'workCategory',
      label: 'Kategori Kerja',
      type: EFieldType.ENUM,
      placeHolder: '',
      description: '',
      enumOptions: Object.keys(WorkCategory).map(
        key => WorkCategory[key as keyof typeof WorkCategory]
      ) as string[],
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
      type: EFieldType.SELECT,
      placeHolder: '',
      description: '',
    },
    {
      name: 'personnelIds',
      label: 'PIC Corintek',
      type: EFieldType.CUSTOM,
      placeHolder: '',
      description: '',
      customComponent: (
        field: ControllerRenderProps<FieldValues, Path<FieldValues>>
      ) => React.createElement(SelectPersonnels, { field, dataGroup: data }),
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
