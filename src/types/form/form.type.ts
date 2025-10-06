export interface IFormFields {
  name: string;
  icon?: React.ComponentType;
  className?: string;
  type: EFieldType;
  label: string;
  placeHolder: string;
  description: string;
  enumOptions?: string[];
}

export enum EFieldType {
  TEXT = 'text',
  ENUM = 'enum',
  SELECT = 'select',
  BOOLEAN = 'boolean',
  FILE = 'file',
  PASSWORD = 'password',
  URL = 'url',
  EMAIL = 'email',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
}