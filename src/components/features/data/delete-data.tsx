import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import useDeleteData from '@/hooks/useDeleteData';
import { UniqueIdentifier } from '@dnd-kit/core';
import { IconTrashX } from '@tabler/icons-react';

interface IDeleteDataProps {
  confirmDeleteButtonColor?: string;
  context: TDataContext;
  dataName?: string;
  apiUrl: string;
  id: UniqueIdentifier;
  refreshData?: () => void;
}

export type TDataContext = 'user' | 'client' | 'project' | 'document';

export default function DeleteData(props: IDeleteDataProps) {
  const { isLoading, handleDeleteData } = useDeleteData(
    props.id,
    props.apiUrl,
    props.refreshData
  );
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center justify-center hover:bg-red-700"
        >
          <IconTrashX className="mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-800">
            Apakah anda yakin menghapus {props.context} ini?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {props.dataName && (
              <span className="italic font-semibold text-red-400">
                {props.dataName}
              </span>
            )}
            <p className="mt-3">
              Hal ini tidak bisa dibatalkan. Tindakan ini juga akan menghapus{' '}
              {props.context} ini secara permanen dari server.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={`${
              props.confirmDeleteButtonColor
                ? props.confirmDeleteButtonColor
                : 'bg-red-700 hover:bg-red-600'
            }`}
            onClick={handleDeleteData}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
