'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  // Extract text-related classes from className for the icon
  const getTextClassesFromClassName = (className: string) => {
    const textClasses = [
      'text-red',
      'text-blue',
      'text-green',
      'text-yellow',
      'text-purple',
      'text-pink',
      'text-indigo',
      'text-gray',
      'text-white',
      'text-black',
      'text-slate',
      'text-zinc',
      'text-neutral',
      'text-stone',
      'text-orange',
      'text-amber',
      'text-lime',
      'text-emerald',
      'text-teal',
      'text-cyan',
      'text-sky',
      'text-violet',
      'text-fuchsia',
      'text-rose',
      // Text opacity classes
      'text-opacity',
      // Text color with opacity (e.g., text-red-500/80)
      /text-(red|blue|green|yellow|purple|pink|indigo|gray|white|black|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+\/\d+/,
    ];

    return className
      .split(' ')
      .filter(cls => {
        // Check for exact matches
        if (
          textClasses.some(tc => typeof tc === 'string' && cls.startsWith(tc))
        ) {
          return true;
        }
        // Check for regex matches
        if (textClasses.some(tc => tc instanceof RegExp && tc.test(cls))) {
          return true;
        }
        return false;
      })
      .join(' ');
  };

  const iconTextClasses = getTextClassesFromClassName(className || '');

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className={cn(
            'pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200',
            // Apply text classes if found, otherwise use default
            iconTextClasses || 'text-muted-foreground'
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
