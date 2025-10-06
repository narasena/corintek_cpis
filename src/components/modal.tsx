import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface IModalProps {
  trigger: React.ReactNode | string;
  title: React.ReactNode | string;
  description?: React.ReactNode | string;
  content?: React.ReactNode;
  className?: string;
}

export default function Modal(props: IModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild className="flex items-center gap-2">
        {props.trigger}
      </DialogTrigger>
      <DialogContent
        className={cn(
          'sm:max-w-2xl !overflow-y-auto !max-h-screen my-4',
          props.className
        )}
      >
        <DialogHeader className="">
          <DialogTitle>{props.title}</DialogTitle>
          {props.description && (
            <DialogDescription>{props.description}</DialogDescription>
          )}
        </DialogHeader>
        {props.content}
      </DialogContent>
    </Dialog>
  );
}
