import { IDefaultFormComponentProps } from '@/types/form/form.type';
import { useForm } from 'react-hook-form';
import { chemicalSchema, TChemicalAttributes } from '../schemas/chemicalSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormHandleSubmit from '@/hooks/useFormHandleSubmit';
import DefaultForm from '@/components/features/forms/default-form';
import { chemicalFormFields } from '../data/chemicalFormFields';

export interface IChemicalFormProps extends IDefaultFormComponentProps {}

export default function ChemicalForm({ refetch }: IChemicalFormProps) {
  const chemicalForm = useForm<TChemicalAttributes>({
    resolver: zodResolver(chemicalSchema),
    defaultValues: {
      code: '',
      name: '',
      type: undefined,
      description: '',
      unit: '',
    },
  });
  const { onSubmit, onInvalid, isLoading } = useFormHandleSubmit({
    form: chemicalForm,
    apiUrl: '/chemicals',
    refetch,
  });

  return (
    <DefaultForm<TChemicalAttributes>
      form={chemicalForm}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      formFieldSelector={{
        type: 'default',
        formFields: chemicalFormFields,
      }}
      validationSchema={chemicalSchema}
      isLoading={isLoading}
    />
  );
}
