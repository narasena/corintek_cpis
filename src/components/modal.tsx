import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface IModalProps {
  trigger: React.ReactNode | string;
  title: React.ReactNode | string;
  description?: React.ReactNode | string;
  content?: React.ReactNode;
}

export default function Modal(props: IModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild className='flex items-center gap-2'>{props.trigger}</DialogTrigger>
      <DialogContent className='w-full'>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description && <DialogDescription>{props.description}</DialogDescription>}
        </DialogHeader>
        {props.content}
      </DialogContent>
    </Dialog>
  );
}
