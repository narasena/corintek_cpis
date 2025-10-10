import { DataTable, ITableTab } from '@/components/data-table';
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
import useClientById from '@/hooks/clients/useClientById';
import { IClientPersonnel } from '@/types/client.type';

interface IClientDataProps {
  clientId: string;
}

export default function ClientData(props: IClientDataProps) {
  const { clientData, isLoading } = useClientById(props.clientId);

  const data = [
    {
      value: 'client-info',
      triggerLabel: 'Informasi Klien',
      content: (
        <div className="space-y-4">
          {clientData ? (
            <>
              <div>
                <h3 className="font-semibold text-lg">{clientData.name}</h3>
                <p className="text-gray-600">{clientData.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Email:</label>
                  <p>{String(clientData.email || 'N/A')}</p>
                </div>
                <div>
                  <label className="font-medium">Phone:</label>
                  <p>{String(clientData.phoneNumber || 'N/A')}</p>
                </div>
                <div>
                  <label className="font-medium">Website:</label>
                  <p>{String(clientData.websiteUrl || 'N/A')}</p>
                </div>
                <div>
                  <label className="font-medium">Address:</label>
                  <p>{String(clientData.address || 'N/A')}</p>
                </div>
              </div>
            </>
          ) : (
            <div>
              {isLoading
                ? '⏳ Loading client information...'
                : 'No client data available'}
            </div>
          )}
        </div>
      ),
    },
    {
      value: 'client-pic',
      triggerLabel: 'PIC Klien',
      content: (
        <DataTable
          tabs={
            [
              {
                value: 'default',
                label: 'PIC Klien',
                data: clientData?.personnels || [],
                columns: clientPICColumns(),
                addNewRow: (
                  <CreateData
                    buttonText="Tambah PIC Klien"
                    modalTitle="Tambah PIC Klien Baru"
                    modalDescription="Menambahkan PIC Klien baru ke dalam data klien di CPIS"
                    content={<ClientPicForm clientId={props.clientId} />}
                  />
                ),
              },
            ] as ITableTab<IClientPersonnel>[]
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
