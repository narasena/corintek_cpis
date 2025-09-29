import { UniqueIdentifier } from "@dnd-kit/core";

export interface IUniqueIdentifierId {
  id: UniqueIdentifier;
}

export interface ITableHelper extends IUniqueIdentifierId {
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt?: string | null;
}

export interface IIMage {
  url?: string;
  publicId?: string;
}