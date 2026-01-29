import {
  ContractType,
  ProjectType,
  WorkCategory,
} from '@/features/api/generated/prisma/enums';
import {
  EFieldType,
  IFormFields,
  ISelectDataFormField,
} from '@/types/form/form.type';
import { IPersonnelGroup, IProject } from '@/types/project.type';
import { SelectPersonnel } from '../components/select-personnel';
import React from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import enumOptions from '@/utils/enumOptions';

interface IProjectCreationFormFields {
  clients: ISelectDataFormField[];
  personnel: IPersonnelGroup[];
  clientPersonnel: IPersonnelGroup[];
  projects: IProject[];
}
export const projectCreationFormFields = (
  selectData: IProjectCreationFormFields,
  formValues: { type: ProjectType }
) => {
  const fields = [
    {
      name: 'clientId',
      label: 'Klien',
      type: EFieldType.SELECT,
      placeHolder: '',
      className: 'col-span-2',
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
      className: 'max-sm:col-span-2',
      customComponent: (
        field: ControllerRenderProps<FieldValues, Path<FieldValues>>
      ) =>
        React.createElement(SelectPersonnel, {
          field,
          dataGroup: selectData.clientPersonnel,
        }),
    },
    {
      name: 'personnelIds',
      label: 'PIC Corintek',
      type: EFieldType.CUSTOM,
      placeHolder: '',
      description: '',
      className: 'max-sm:col-span-2',
      customComponent: (
        field: ControllerRenderProps<FieldValues, Path<FieldValues>>
      ) =>
        React.createElement(SelectPersonnel, {
          field,
          dataGroup: selectData.personnel,
        }),
    },
  ] as IFormFields[];

  if (formValues?.type === ProjectType.ADDENDUM) {
    fields.splice(9, 0, {
      name: 'parentId',
      label: 'Proyek Sebelumnya',
      type: EFieldType.SELECT,
      className: 'col-span-2',
      placeHolder: '',
      selectData: selectData.projects.map(project => ({
        label: project.name,
        value: project.id,
      })),
    });
  }

  return fields;
};
