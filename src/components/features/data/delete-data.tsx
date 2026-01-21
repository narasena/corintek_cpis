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
import { IconTrashX } from '@tabler/icons-react';
import React, { useState } from 'react';

interface IDeleteDataProps {
  confirmDeleteButtonColor?: string;
  context: TDataContext;
  dataName?: string;
  onDelete: () => void | Promise<void>;
  trigger?: React.ReactNode;
  loading?: boolean;
}

export type TDataContext = 'user' | 'client' | 'project' | 'document';

export default function DeleteData(props: IDeleteDataProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await props.onDelete();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {props.trigger ? (
          props.trigger
        ) : (
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center justify-center"
          >
            <IconTrashX className="mr-1" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        {props.loading ? (
          <Spinner className="mr-2" />
        ) : (
          <>
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
                  Hal ini tidak bisa dibatalkan. Tindakan ini juga akan
                  menghapus {props.context} ini secara permanen dari server.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={props.loading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={props.loading}
                className={`${
                  props.confirmDeleteButtonColor
                    ? props.confirmDeleteButtonColor
                    : 'bg-red-700 hover:bg-red-600'
                }`}
                onClick={handleDelete}
              >
                {props.loading && <Spinner className="mr-2" />}
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
