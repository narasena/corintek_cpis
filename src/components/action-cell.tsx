'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface IActionCellProps<TData> {
  data: TData;
  entityName: string;
  getDisplayName?: (data: TData) => string;
  onEdit: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  getEntityId: (data: TData) => string;
  children?: React.ReactNode;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ActionCell<TData>({
  data,
  entityName,
  getDisplayName,
  onEdit,
  onDelete,
  getEntityId,
  children,
  canEdit = true,
  canDelete = true,
}: IActionCellProps<TData>) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const id = getEntityId(data);
      const result = await onDelete(id);
      if (result.success) {
        toast.success(`${entityName} berhasil dihapus`);
        setShowDeleteAlert(false);
      } else {
        toast.error(`Gagal menghapus ${entityName.toLowerCase()}`, {
          description: result.error,
        });
      }
    });
  };

  const displayName = getDisplayName ? getDisplayName(data) : entityName;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          {children}
          {canEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Ubah
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteAlert(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Hapus
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. {entityName}{' '}
              <strong>{displayName}</strong> akan dihapus secara permanen dari
              sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
