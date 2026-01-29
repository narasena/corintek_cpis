import formDataNameFormatter, {
  IFormDataNameFormatterParams,
} from './formDataNameFormatter';

export default function uploadFormDataFormatter(
  params: IFormDataNameFormatterParams
) {
  const { prefix, customKey } = formDataNameFormatter(params);

  const formData = new FormData();

  formData.append(params.fileType, params.file, params.file.name);
  formData.append('prefix', prefix);
  formData.append('key', customKey);
  return formData;
}
