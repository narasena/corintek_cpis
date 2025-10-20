import { ValueType } from '@/features/api/generated/prisma';
import {
  EFieldType,
  IFormFieldBasic,
  IFormFields,
  IFormFieldsBase,
  IFormFieldsTypeSelect,
} from '@/types/form/form.type';

interface IValueLogSheetFormFieldGeneratorParam<T extends ValueType>
  extends IFormFieldsBase {
  valueType: T;
  name: string;
  icon?: React.ComponentType;
  label: string;
  className?: string;
  textType?: EFieldType.TEXT | EFieldType.TEXTAREA;
  placeHolder?: string;
  description?: string;
  customBooleanSelect?: {
    trueLabel: string;
    falseLabel: string;
  };
}
export function valueLogSheetFormFieldGenerator<T extends ValueType>(
  params: IValueLogSheetFormFieldGeneratorParam<T>
): Extract<IFormFields, { type: EFieldType }> | undefined {
  const {
    valueType,
    name,
    icon,
    className,
    textType,
    label,
    placeHolder,
    description,
    customBooleanSelect,
  } = params;
  switch (valueType) {
    case ValueType.NUMBER:
      return {
        name,
        icon,
        type: EFieldType.NUMBER,
        label,
        className,
        placeHolder: placeHolder ?? '0',
        description,
      } as IFormFieldBasic; // Cast safe due to switch

    case ValueType.TEXT:
      return {
        name,
        icon,
        type: textType ?? EFieldType.TEXT,
        label,
        className,
        placeHolder: placeHolder ?? '',
        description,
      } as IFormFieldBasic;
    case ValueType.BOOLEAN:
      return {
        name,
        icon,
        type: EFieldType.SELECT,
        label,
        className,
        description,
        selectData: [
          { label: customBooleanSelect?.trueLabel ?? 'Ya', value: 'true' },
          { label: customBooleanSelect?.falseLabel ?? 'Tidak', value: 'false' },
        ],
      } as IFormFieldsTypeSelect;

    // Add more cases here for future ValueType enums (e.g., ENUM would require enumOptions in params)
    default:
      // Exhaustiveness check: If you add a new ValueType, TS will error here if not handled
      const _exhaustiveCheck: never = valueType;
      throw new Error(`Unsupported valueType: ${_exhaustiveCheck}`);
  }
}
