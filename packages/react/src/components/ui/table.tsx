import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React from 'react';

import { cn } from '../../lib/theme-utils';

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
  <thead ref={ref} className={cn('bg-muted text-primary text-sm', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  disableHover?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, disableHover, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        !disableHover && 'hover:bg-muted/50',
        'border-border/50 border-b text-sm transition-colors',
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
  ({ className, children, isSortable, sortDirection, ...props }, ref) => {
    const showSortIcon = isSortable !== undefined && sortDirection !== undefined;

    return (
      <th
        ref={ref}
        className={cn(
          'hover:bg-accent/10 border-border/50 border-b px-4 py-2 text-left',
          isSortable && 'group cursor-pointer select-none',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-1">
          {children}
          {showSortIcon && (
            <div className="ml-2 flex items-center">
              {sortDirection === false && (
                <ChevronDownIcon className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              )}
              {sortDirection === 'asc' && <ChevronUpIcon className="h-4 w-4" />}
              {sortDirection === 'desc' && <ChevronDownIcon className="h-4 w-4" />}
            </div>
          )}
        </div>
      </th>
    );
  },
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
