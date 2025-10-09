import { EFieldType, IFormFields } from '@/types/form/form.type';

export const loginFormFields: IFormFields[] = [
  {
    name: 'email',
    type: EFieldType.EMAIL,
    label: 'Email',
    placeHolder: 'Email',
    description: 'Masukkan email Anda',
    className: 'col-span-2',
  },
  {
    name: 'password',
    type: EFieldType.PASSWORD,
    label: 'Password',
    description: 'Masukkan password Anda',
    className: 'col-span-2',
  },
];
