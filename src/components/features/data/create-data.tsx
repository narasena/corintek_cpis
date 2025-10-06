import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import * as React from 'react';

interface ICreateDataProps {
  buttonText: string;
  modalTitle: string;
  modalDescription?: string;
  content: React.ReactNode;
}

export default function CreateData(props: ICreateDataProps) {
  return (
    <Modal
      trigger={
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">{props.buttonText}</span>
        </Button>
      }
      title={props.modalTitle}
      description={props.modalDescription}
      content={props.content}
    />
  );
}
