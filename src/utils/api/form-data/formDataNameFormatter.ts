import { UniqueIdentifier } from '@dnd-kit/core';
import timestampFormatter from './timestampFormatter';

export type TFileNamePrefixes = 'default' | 'avatar' | 'log_sheet' | 'file';
export type TFileTypes = 'image' | 'document' | 'file';
export enum EFileFolders {
  USERS = 'users',
  CLIENTS = 'clients',
  PROJECTS = 'projects',
  LOG_SHEETS = 'log_sheets',
  REPORTS = 'reports',
  ABSENCE = 'absence',
  FILES = 'files',
}

export interface IFormDataNameFormatterParams {
  file: File;
  fileNamePrefix: TFileNamePrefixes;
  fileFolder: EFileFolders;
  fileType: TFileTypes;
  relativeId?: UniqueIdentifier;
}

export default function formDataNameFormatter(
  params: IFormDataNameFormatterParams
) {
  const timestamp = timestampFormatter();
  const extension = params.file.name.split('.').pop();
  const fileName = `${params.fileNamePrefix}-${timestamp}-${params.relativeId}`;
  const prefix = `${params.fileFolder}/${params.fileType}`;
  const customKey = `${prefix}/${fileName}.${extension}`;

  return { prefix, customKey };
}
