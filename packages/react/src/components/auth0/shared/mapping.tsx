import React from 'react';

import { DataTable, type Column } from './data-table';
import { Section } from './section';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MappingProps<Item> {
  title?: string;
  description?: string;
  content: React.ReactNode;
  card: {
    title: string;
    description: string;
    table: {
      items: Item[];
      columns: Column<Item>[];
    };
  };
  className?: string;
  expanded?: boolean;
}

export function Mapping<Item>({
  title,
  description,
  card,
  content,
  className,
  expanded = true,
}: MappingProps<Item>) {
  return (
    <div className={cn('w-full space-y-6', className)}>
      <Section title={title} description={description}>
        {content}
        <Accordion
          type="single"
          defaultValue={expanded ? 'mapping-section' : undefined}
          collapsible
          className="w-full space-y-6"
        >
          <AccordionItem value="mapping-section">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <CardDescription className="text-sm font-normal">
                  {card.description}
                </CardDescription>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <DataTable data={card.table.items} columns={card.table.columns} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
    </div>
  );
}
