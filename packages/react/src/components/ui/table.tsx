/**
 * Table component with sorting support.
 * @module table
 * @internal
 */

'use client';

import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="shadow-bevel-sm w-full overflow-clip rounded-2xl">
      <div className="overflow-x-auto">
        <table ref={ref} className={cn('w-full border-collapse', className)} {...props} />
      </div>
    </div>
  ),
);
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
  ({ className, children, isSortable, sortDirection, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'text-muted-foreground h-12 px-4 text-left align-middle font-medium',
        isSortable && 'cursor-pointer select-none',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {isSortable && (
          <div className="ml-1 flex items-center">
            {sortDirection === false && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ChevronUpIcon className="text-muted-foreground/50 h-4 w-4" />
              </Button>
            )}
            {sortDirection === 'asc' && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ChevronUpIcon className="h-4 w-4" />
              </Button>
            )}
            {sortDirection === 'desc' && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 align-middle', className)} {...props} />
));
TableCell.displayName = 'TableCell';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
}

export interface SortConfig<T> {
  key: keyof T | null;
  direction: 'asc' | 'desc';
}

type SelectionProps<T> =
  | { selectedRows?: never; onSelectedRowsChange?: never }
  | { selectedRows: T[]; onSelectedRowsChange: (selectedRows: T[]) => void };

export type DataTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  onSortChange?: (sortConfig: SortConfig<T>) => void;
  sortConfig?: SortConfig<T>;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  showSearch?: boolean;
  selectable?: boolean;
  getRowId?: (row: T) => string | number;
} & SelectionProps<T>;

function DataTable<T extends object>({
  data,
  columns,
  className,
  onSortChange,
  sortConfig: controlledSortConfig,
  onSearchChange,
  searchQuery: controlledSearchQuery,
  showSearch = true,
  selectable = false,
  selectedRows: controlledSelectedRows,
  onSelectedRowsChange,
  getRowId,
}: DataTableProps<T>) {
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig<T>>({
    key: null,
    direction: 'asc',
  });

  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>([]);

  useEffect(() => {
    setInternalSelectedRows([]);
  }, [data]);

  const isServerSideSort = !!onSortChange;
  const isServerSideSearch = !!onSearchChange;
  const isControlledSelection = controlledSelectedRows !== undefined;

  const sortConfig =
    isServerSideSort && controlledSortConfig ? controlledSortConfig : internalSortConfig;
  const searchQuery =
    isServerSideSearch && controlledSearchQuery !== undefined
      ? controlledSearchQuery
      : internalSearchQuery;
  const selectedRows = isControlledSelection ? controlledSelectedRows! : internalSelectedRows;

  const selectedRowIds = useMemo((): Set<string | number> | Set<T> => {
    if (getRowId) {
      return new Set(selectedRows.map((row) => getRowId(row)));
    }
    return new Set(selectedRows);
  }, [selectedRows, getRowId]);

  const getRowIdentifier = (row: T, index: number): string | number => {
    if (getRowId) return getRowId(row);
    return index;
  };

  const isRowSelected = (row: T, index: number): boolean => {
    if (getRowId) {
      return (selectedRowIds as Set<string | number>).has(getRowId(row));
    }
    return (selectedRowIds as Set<T>).has(row);
  };

  const handleRowSelect = (row: T, index: number, checked: boolean) => {
    let newSelectedRows: T[];

    if (checked) {
      newSelectedRows = [...selectedRows, row];
    } else {
      if (getRowId) {
        newSelectedRows = selectedRows.filter((selected) => getRowId(selected) !== getRowId(row));
      } else {
        newSelectedRows = selectedRows.filter((selected) => selected !== row);
      }
    }

    if (onSelectedRowsChange) {
      onSelectedRowsChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    let newSelectedRows: T[];

    if (checked === true) {
      newSelectedRows = [...processedData];
    } else {
      newSelectedRows = [];
    }

    if (onSelectedRowsChange) {
      onSelectedRowsChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  };

  const handleSort = (key: keyof T) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig: SortConfig<T> = { key, direction: newDirection };

    if (onSortChange) {
      onSortChange(newSortConfig);
    } else {
      setInternalSortConfig(newSortConfig);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;

    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
  };

  const processedData = useMemo(() => {
    let result = [...data];

    if (!isServerSideSearch && internalSearchQuery) {
      const lowerQuery = internalSearchQuery.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(lowerQuery)),
      );
    }

    if (!isServerSideSort && internalSortConfig.key) {
      result.sort((a, b) => {
        const aValue = String(a[internalSortConfig.key!]);
        const bValue = String(b[internalSortConfig.key!]);

        if (internalSortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [data, isServerSideSearch, internalSearchQuery, isServerSideSort, internalSortConfig]);

  const areAllRecordsSelected = useMemo((): boolean | 'indeterminate' => {
    if (processedData.length === 0) return false;

    let selectedCount = 0;
    for (const row of processedData) {
      if (getRowId) {
        if ((selectedRowIds as Set<string | number>).has(getRowId(row))) {
          selectedCount++;
        }
      } else {
        if ((selectedRowIds as Set<T>).has(row)) {
          selectedCount++;
        }
      }
    }

    if (selectedCount === 0) return false;
    if (selectedCount === processedData.length) return true;
    return 'indeterminate';
  }, [processedData, selectedRowIds, getRowId]);

  return (
    <div className={cn('w-full', className)}>
      {showSearch && (
        <div className="mb-4 flex justify-end">
          <TextField
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            startAdornment={<SearchIcon className="h-4 w-4" />}
            className="max-w-xs"
          />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  className="cursor-pointer"
                  checked={areAllRecordsSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.accessor)}
                isSortable={column.sortable}
                sortDirection={
                  column.sortable
                    ? sortConfig.key === column.accessor
                      ? sortConfig.direction
                      : false
                    : undefined
                }
                onClick={column.sortable ? () => handleSort(column.accessor) : undefined}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="text-muted-foreground text-center"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            processedData.map((row, rowIndex) => (
              <TableRow
                key={getRowIdentifier(row, rowIndex)}
                className={cn(isRowSelected(row, rowIndex) && 'bg-muted/50')}
              >
                {selectable && (
                  <TableCell className="w-12">
                    <Checkbox
                      className="cursor-pointer"
                      checked={isRowSelected(row, rowIndex)}
                      onCheckedChange={(checked) =>
                        handleRowSelect(row, rowIndex, checked === true)
                      }
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.accessor)}>
                    {String(row[column.accessor])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export { DataTable, Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
