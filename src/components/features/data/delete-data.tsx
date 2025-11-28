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
import { IconTrashX } from '@tabler/icons-react';

interface IDeleteDataProps {
  confirmDeleteButtonColor?: string;
  context: TDataContext;
  dataName?: string;
  onDelete: () => void;
}

export type TDataContext = 'user' | 'client' | 'project' | 'document';

export default function DeleteData(props: IDeleteDataProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center justify-center"
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={`${
              props.confirmDeleteButtonColor
                ? props.confirmDeleteButtonColor
                : 'bg-red-700 hover:bg-red-600'
            }`}
            onClick={props.onDelete}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
