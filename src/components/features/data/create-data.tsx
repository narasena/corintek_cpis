import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import * as React from 'react';

interface ICreateDataProps {
  buttonText: string;
  icon?: React.ComponentType;
  modalTitle: string;
  modalDescription?: string;
  content: React.ReactNode;
}

export default function CreateData(props: ICreateDataProps) {
  const CustomIcon = props.icon as React.JSX.ElementType;
  return (
    <Modal
      trigger={
        <Button variant="outline" size="sm">
          {props.icon ? <CustomIcon /> : <IconPlus />}
          <span className="hidden lg:inline">{props.buttonText}</span>
        </Button>
      }
      title={props.modalTitle}
      description={props.modalDescription}
      content={props.content}
    />
  );
}
