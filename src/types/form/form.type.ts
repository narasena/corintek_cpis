export interface IFormFields {
  name: string;
  icon?: React.ComponentType;
  className?: string;
  type: EFieldType;
  label: string;
  placeHolder: string;
  description: string;
}

export enum EFieldType {
  TEXT = 'text',
  ENUM = 'enum',
  SELECT = 'select',
  BOOLEAN = 'boolean',
  FILE = 'file',
  PASSWORD = 'password',
  EMAIL = 'email',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
}