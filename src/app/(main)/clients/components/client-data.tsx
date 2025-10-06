import { DataTable } from '@/components/data-table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { IUser } from '@/types/user.type';
import { clientPICColumns } from './client-pic-column';
import CreateData from '@/components/features/data/create-data';
import ClientPicForm from './client-pic-form';

export default function ClientData() {
  const data = [
    {
      value: 'client-info',
      triggerLabel: 'Informasi Klien',
      content: <div>Informasi Klien</div>,
    },
    {
      value: 'client-pic',
      triggerLabel: 'PIC Klien',
      content: (
        <DataTable
          data={[] as IUser[]}
          columns={clientPICColumns()}
          addNewRow={
            <CreateData
              buttonText="Tambah PIC Klien"
              modalTitle="Tambah PIC Klien Baru"
              modalDescription="Menambahkan PIC Klien baru ke dalam data klien di CPIS"
              content={<ClientPicForm />}
            />
          }
        />
      ),
    },
    {
      value: 'project',
      triggerLabel: 'Proyek',
      content: <div>Alamat Klien</div>,
    },
  ];
  return (
    <Accordion type="single" collapsible>
      {data.map((item, index) => (
        <AccordionItem value={item.value} key={index}>
          <AccordionTrigger className="bg-blue-50 hover:bg-blue-200 hover:no-underline px-6">
            {item.triggerLabel}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
