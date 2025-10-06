import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { IconEye } from '@tabler/icons-react';

interface ISlugDataProps {
  type: 'nameSlug' | 'quickView';
  onClick?: () => void;
  buttonText?: string;
  modalTitle: string;
  modalDescription?: string;
  content: React.ReactNode;
}

export default function SlugData(props: ISlugDataProps) {
  return (
    <Modal
      className="max-w-5xl"
      trigger={
        props.type === 'nameSlug' ? (
          <span
            className="text-blue-800 text-sm font-semibold hover:underline cursor-pointer"
            onClick={props.onClick}
          >
            {props.buttonText}
          </span>
        ) : (
          <Button variant="outline" size="sm" onClick={props.onClick}>
            <IconEye />
          </Button>
        )
      }
      title={props.modalTitle}
      description={props.modalDescription}
      content={props.content}
    />
  );
}
