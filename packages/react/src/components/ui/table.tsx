import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/theme-utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="shadow-bevel-sm w-full overflow-clip rounded-2xl">
    <div className="overflow-x-auto">
      <table ref={ref} className={cn('w-full border-collapse', className)} {...props} />
    </div>
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-muted text-sm', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'hover:bg-muted/50 border-border/50 border-b text-sm transition-colors',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  isSortable?: boolean;
  sortDirection?: 'asc' | 'desc' | false;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, isSortable, sortDirection, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'hover:bg-accent/10 border-border/50 border-b px-4 py-2 text-left',
        isSortable && 'select-none',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {isSortable && (
          <div className="ml-2 flex items-center">
            {sortDirection === false && (
              <Button variant="ghost" size="sm" className="px-0.5 py-1">
                <ChevronUpIcon className="text-muted-foreground h-4 w-4" />
              </Button>
            )}
            {sortDirection === 'asc' && (
              <Button variant="ghost" size="sm" className="px-0.5 py-1">
                <ChevronUpIcon className="h-4 w-4" />
              </Button>
            )}
            {sortDirection === 'desc' && (
              <Button variant="ghost" size="sm" className="px-0.5 py-1">
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </th>
  ),
);
TableHead.displayName = 'TableHead';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('px-4 py-2', className)} {...props} />
  ),
);
TableCell.displayName = 'TableCell';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
