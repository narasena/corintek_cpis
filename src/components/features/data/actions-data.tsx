import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon, IconPlus, IconProps } from '@tabler/icons-react';
import * as React from 'react';

interface ICreateDataProps {
  buttonText: string;
  icon?: React.ComponentType;
  className?: string;
  iconClassName?: string;
  modalTitle: string;
  modalDescription?: string;
  content: React.ReactNode;
}

export default function ActionsData(props: ICreateDataProps) {
  const CustomIcon = props.icon as React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  >;
  return (
    <Modal
      trigger={
        <Button
          variant="outline"
          size="sm"
          className={cn('flex items-center justify-start', props.className)}
        >
          {props.icon ? (
            <CustomIcon className={cn('', props.iconClassName)} />
          ) : (
            <IconPlus className={props.iconClassName} />
          )}
          <span className="hidden lg:inline">{props.buttonText}</span>
        </Button>
      }
      title={props.modalTitle}
      description={props.modalDescription}
      content={props.content}
    />
  );
}
