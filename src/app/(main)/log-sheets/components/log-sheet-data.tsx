import SlugData from '@/components/features/data/slug-data';
import LogSheetDocument, { ILogSheetDocumentProps } from './log-sheet-document';

export interface ILogSheetDataProps extends ILogSheetDocumentProps {}

export default function LogSheetData(props: ILogSheetDataProps) {
  const formattedDate = new Date(props.date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <SlugData
      modalTitle={`Log Sheet (${formattedDate})`}
      type="nameSlug"
      buttonText={formattedDate}
      content={<LogSheetDocument />}
    />
  );
}
