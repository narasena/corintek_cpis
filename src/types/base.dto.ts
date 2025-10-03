import { UniqueIdentifier } from '@dnd-kit/core';

export interface IUniqueIdentifierId {
  id: UniqueIdentifier;
}

export interface ITableHelper extends IUniqueIdentifierId {
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  deletedAt?: Date | string | null;
}

export interface IIMage {
  url?: string | null;
  publicId?: string | null;
}
