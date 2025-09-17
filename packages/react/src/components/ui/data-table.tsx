import type { ActionButton as CoreActionButton } from '@auth0-web-ui-components/core';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { SortingState, ColumnDef } from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ArrowUpDownIcon, Copy } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { InlineCode } from '@/components/ui/inline-code';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/theme-utils';

import { Spinner } from './spinner';

interface ActionButton extends Omit<CoreActionButton, 'onClick'> {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

type AlignmentType = 'left' | 'center' | 'right';

export interface BaseColumn<Item> {
  title: string;
  accessorKey: keyof Item;
  width?: string;
  enableSorting?: boolean;
  headerAlign?: AlignmentType;
}

export interface TextColumn<Item> extends BaseColumn<Item> {
  type: 'text';
  noValueLabel?: string;
  render?: (item: Item, value: unknown) => React.ReactNode;
}

export interface DateColumn<Item> extends BaseColumn<Item> {
  type: 'date';
  format?: 'short' | 'medium' | 'long' | 'relative';
  noValueLabel?: string;
  render?: (item: Item, value: Date | string | number) => React.ReactNode;
}

export interface SwitchColumn<Item> extends BaseColumn<Item> {
  type: 'switch';
  onToggle?: (checked: boolean, item: Item) => void;
  render?: (item: Item, value: boolean) => React.ReactNode;
}

export interface ButtonColumn<Item> extends BaseColumn<Item> {
  type: 'button';
  buttonText: string;
  variant?: 'primary' | 'outline' | 'destructive' | 'ghost' | 'link';
  onClick: (item: Item) => void;
  render?: (item: Item, value: unknown) => React.ReactNode;
}

export interface CopyColumn<Item> extends BaseColumn<Item> {
  type: 'copy';
  noValueLabel?: string;
  render?: (item: Item, value: unknown) => React.ReactNode;
}

export interface ActionsColumn<Item> extends Omit<BaseColumn<Item>, 'accessorKey'> {
  type: 'actions';
  accessorKey?: keyof Item;
  render: (item: Item) => React.ReactNode;
}

export interface CustomColumn<Item> extends BaseColumn<Item> {
  type: 'custom';
  render: (item: Item, value: unknown) => React.ReactNode;
}

export type Column<Item> =
  | TextColumn<Item>
  | DateColumn<Item>
  | SwitchColumn<Item>
  | ButtonColumn<Item>
  | CopyColumn<Item>
  | ActionsColumn<Item>
  | CustomColumn<Item>;

export interface EmptyStateProps {
  title: string;
  subtitle: string;
  action?: ActionButton;
}

export interface DataTableProps<Item> {
  data: Item[];
  columns: Column<Item>[];
  loading?: boolean;
  loader?: React.ReactNode;
  emptyState?: EmptyStateProps;
  onRowClick?: (rowData: Item) => void;
  className?: string;
  headerAlign?: AlignmentType;
}

const resolveAlignment = (
  columnAlign?: AlignmentType,
  tableAlign?: AlignmentType,
  defaultAlign: AlignmentType = 'left',
): AlignmentType => {
  return columnAlign ?? tableAlign ?? defaultAlign;
};

const getTextAlignmentClass = (align: AlignmentType): string => {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'left':
    default:
      return 'text-left';
  }
};

const getFlexAlignmentClass = (align: AlignmentType): string => {
  switch (align) {
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    case 'left':
    default:
      return 'justify-start';
  }
};

const formatDate = (value: Date | string | number, format: string = 'medium'): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Invalid Date';

  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'relative': {
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (Math.abs(diffDays) === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 0) return `In ${diffDays} days`;
      return `${Math.abs(diffDays)} days ago`;
    }
    case 'medium':
    default:
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
};

function CopyColumnRenderer<Item>({
  item,
  value,
  column,
}: {
  item: Item;
  value: unknown;
  column: CopyColumn<Item>;
}) {
  const [copied, setCopied] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTooltipOpen(true);

      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  if (column.render) {
    return <>{column.render(item, value)}</>;
  }

  if (!value) {
    return <span className="text-muted-foreground">{column.noValueLabel ?? '—'}</span>;
  }

  return (
    <InlineCode className="max-w-[200px] flex items-center justify-between gap-2 pr-1">
      <span className="truncate text-muted-foreground">{String(value)}</span>

      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-muted/50 shrink-0"
            aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </InlineCode>
  );
}

function renderTextColumn<Item>(
  item: Item,
  value: unknown,
  column: TextColumn<Item>,
): React.ReactNode {
  if (column.render) {
    return column.render(item, value);
  }

  if (value === null) {
    return <span className="text-muted-foreground">{column.noValueLabel ?? '—'}</span>;
  }

  return <span className="text-foreground">{String(value)}</span>;
}

function renderDateColumn<Item>(
  item: Item,
  value: Date | string | number,
  column: DateColumn<Item>,
): React.ReactNode {
  if (column.render) {
    return column.render(item, value);
  }

  if (!value) {
    return <span className="text-muted-foreground">{column.noValueLabel ?? '—'}</span>;
  }

  const formattedDate = formatDate(value, column.format);

  return (
    <span className="text-foreground" title={new Date(value).toISOString()}>
      {formattedDate}
    </span>
  );
}

function renderSwitchColumn<Item>(
  item: Item,
  value: boolean,
  column: SwitchColumn<Item>,
): React.ReactNode {
  if (column.render) {
    return column.render(item, value);
  }

  const handleToggle = (checked: boolean) => {
    column.onToggle?.(checked, item);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Switch checked={!!value} onCheckedChange={handleToggle} />
    </div>
  );
}

function renderButtonColumn<Item>(
  item: Item,
  value: unknown,
  column: ButtonColumn<Item>,
): React.ReactNode {
  if (column.render) {
    return column.render(item, value);
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    column.onClick(item);
  };

  return (
    <Button variant={column.variant} size="sm" onClick={handleClick}>
      {column.buttonText}
    </Button>
  );
}

function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (direction === 'asc') {
    return <ChevronUpIcon className="h-4 w-4" />;
  }
  if (direction === 'desc') {
    return <ChevronDownIcon className="h-4 w-4" />;
  }
  return <ArrowUpDownIcon className="h-4 w-4 opacity-50" />;
}

export function DataTable<Item>({
  data,
  columns,
  loading = false,
  loader,
  emptyState,
  onRowClick,
  className,
  headerAlign: tableHeaderAlign = 'left',
}: DataTableProps<Item>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableColumns = useMemo<ColumnDef<Item>[]>(() => {
    return columns.map((column, index) => {
      const resolvedHeaderAlign = resolveAlignment(
        column.headerAlign, // Column-specific header alignment (highest priority)
        tableHeaderAlign, // Table-level header alignment (medium priority)
        'left', // Default alignment (lowest priority)
      );

      return {
        id: `column-${index}`,
        accessorKey: column.accessorKey as string,
        header: column.title,
        size: column.width
          ? isNaN(Number(column.width))
            ? undefined
            : Number(column.width)
          : undefined,
        enableSorting: column.enableSorting !== false && !!column.accessorKey,
        meta: {
          headerAlign: resolvedHeaderAlign,
          column: column,
        },
        cell: ({ getValue, row }) => {
          const value = getValue();
          const item = row.original;

          switch (column.type) {
            case 'text':
              return renderTextColumn(item, value, column);

            case 'date':
              return renderDateColumn(item, value as Date | string | number, column);

            case 'switch':
              return renderSwitchColumn(item, value as boolean, column);

            case 'button':
              return renderButtonColumn(item, value, column);

            case 'copy':
              return <CopyColumnRenderer item={item} value={value} column={column} />;

            case 'actions':
              return <div onClick={(e) => e.stopPropagation()}>{column.render(item)}</div>;

            case 'custom':
              return <>{column.render(item, value)}</>;

            default:
              return <span className="text-foreground">{String(value) ?? '—'}</span>;
          }
        },
      };
    });
  }, [columns, tableHeaderAlign]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  if (loading) {
    return (
      <div className={cn('w-full flex items-center justify-center py-8', className)}>
        {loader || <Spinner />}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const meta = header.column.columnDef.meta as {
                  headerAlign: AlignmentType;
                  column: Column<Item>;
                };

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      canSort && 'cursor-pointer select-none hover:bg-muted/50',
                      'transition-colors',
                      getTextAlignmentClass(meta.headerAlign),
                    )}
                    style={{
                      width: meta.column.width || undefined,
                      minWidth: meta.column.width || undefined,
                      maxWidth: meta.column.width || undefined,
                    }}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div
                      className={cn(
                        'flex items-center space-x-2',
                        getFlexAlignmentClass(meta.headerAlign),
                      )}
                    >
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {canSort && <SortIcon direction={sortDirection} />}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <EmptyState
                  {...(emptyState ?? {
                    title: 'No data available',
                    subtitle: 'There are no items to display.',
                  })}
                />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  'transition-colors',
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as {
                    column: Column<Item>;
                  };
                  return (
                    <TableCell
                      key={cell.id}
                      className="text-left"
                      style={{
                        width: meta.column.width || undefined,
                        minWidth: meta.column.width || undefined,
                        maxWidth: meta.column.width || undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
