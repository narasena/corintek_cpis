import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Spinner } from '@/components/ui/spinner';
import useProjectById from '@/hooks/projects/useProjectById';

interface IProjectDataProps {
  projectId: string;
}

export default function ProjectData(props: IProjectDataProps) {
  const { project, isLoading } = useProjectById(props.projectId);

  if (isLoading) {
    return (
      <Spinner className="size-12 text-gray-500 self-center items-center" />
    );
  }

  const data = [
    {
      value: 'project-info',
      triggerLabel: 'Informasi Project',
      content: (
        <>
          <div>
            <h3 className="font-semibold text-lg">{project?.name}</h3>
          </div>
          {project?.parent && (
            <div>
              <label className="font-medium">Parent Project:</label>
              <p>{project.parent.name}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Email:</label>
            </div>
          </div>
        </>
      ),
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
