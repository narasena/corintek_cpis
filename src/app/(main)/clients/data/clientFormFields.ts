import { EFieldType, IFormFields } from '@/types/form/form.type';

export const createClientFormFields: IFormFields[] = [
  {
    name: 'name',
    type: EFieldType.TEXT,
    label: 'Client Name',
    placeHolder: 'Client Name',
    description: 'The name of the client',
  },
  {
    name: 'email',
    type: EFieldType.EMAIL,
    label: 'Email',
    placeHolder: 'Email',
    description: 'The email of the client',
  },
  {
    name: 'phoneNumber',
    type: EFieldType.TEXT,
    label: 'Phone Number',
    placeHolder: 'Phone Number',
    description: 'The phone number of the client',
  },
  {
    name: 'websiteUrl',
    type: EFieldType.URL,
    label: 'Website URL',
    placeHolder: 'Website URL',
    description: 'The website URL of the client',
  },
  {
    name: 'description',
    type: EFieldType.TEXTAREA,
    className: 'col-span-2',
    label: 'Description',
    placeHolder: 'Description',
    description: 'The description of the client',
  },
  {
    name: 'address',
    type: EFieldType.TEXTAREA,
    className: 'col-span-2',
    label: 'Address',
    placeHolder: 'Address',
    description: 'The address of the client',
  },
];
