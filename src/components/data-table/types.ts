import { ColumnDef, Table } from '@tanstack/react-table';

export interface ITableTab<TData> {
  value: string;
  label: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  addNewRow?: React.ReactNode;
  filters?: React.ReactNode;
}

export interface IDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  tabs?: ITableTab<TData>[];
  tab?: string;
  onTabChange?: (value: string) => void;
}

export interface IDataTableViewProps<TData, TValue> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
  emptyMessage: string;
}
