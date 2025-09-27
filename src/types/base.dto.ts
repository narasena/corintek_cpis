import { UniqueIdentifier } from "@dnd-kit/core";

export interface ITableHelper{
  id: UniqueIdentifier;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt?: string | null;
}