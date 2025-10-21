import { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

export enum EFieldType {
  TEXT,
  ENUM,
  SELECT,
  BOOLEAN,
  FILE,
  PASSWORD,
  URL,
  EMAIL,
  NUMBER,
  TEXTAREA,
  DATE,
  DATETIME,
  CUSTOM,
  SEPARATOR,
}

export interface IFormFieldsBase {
  name: string;
  icon?: React.ComponentType;
  className?: string;
  label: string;
  placeHolder?: string;
  required?: boolean;
  description?: string;
}

export interface IFormFieldBasic extends IFormFieldsBase {
  type:
    | EFieldType.BOOLEAN
    | EFieldType.DATE
    | EFieldType.DATETIME
    | EFieldType.EMAIL
    | EFieldType.FILE
    | EFieldType.NUMBER
    | EFieldType.PASSWORD
    | EFieldType.TEXT
    | EFieldType.TEXTAREA
    | EFieldType.URL
    | EFieldType.SEPARATOR;
}

export interface IFormFieldsTypeEnum extends IFormFieldsBase {
  type: EFieldType.ENUM;
  enumOptions: string[];
}

export interface IFormFieldsTypeSelect extends IFormFieldsBase {
  type: EFieldType.SELECT;
  selectData: ISelectDataFormField[];
}

export interface IFormFieldsTypeCustom extends IFormFieldsBase {
  type: EFieldType.CUSTOM;
  customComponent:
    | React.ReactNode
    | ((
        field: ControllerRenderProps<FieldValues, Path<FieldValues>>
      ) => React.ReactNode);
}

export type IFormFields =
  | IFormFieldBasic
  | IFormFieldsTypeEnum
  | IFormFieldsTypeSelect
  | IFormFieldsTypeCustom;

export interface ISelectDataFormField {
  label: string;
  value: UniqueIdentifier;
}

export interface IDefaultFormComponentProps {
  refetch?: () => void;
}
