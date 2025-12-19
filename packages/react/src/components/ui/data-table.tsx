import type { ActionButton as CoreActionButton } from '@auth0/universal-components-core';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { SortingState, ColumnDef } from '@tanstack/react-table';
import { Copy } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { cn } from '../../lib/theme-utils';

import { Badge } from './badge';
import { Button } from './button';
import { InlineCode } from './inline-code';
import { Spinner } from './spinner';
import { Switch } from './switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

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
  render?: (item: Item, value: unknown) => React.ReactNode;
}

export interface DateColumn<Item> extends BaseColumn<Item> {
  type: 'date';
  format?: 'short' | 'medium' | 'long' | 'relative';
  render?: (item: Item, value: Date | string | number) => React.ReactNode;
}

export interface SwitchColumn<Item> extends BaseColumn<Item> {
  type: 'switch';
  onToggle?: (checked: boolean, item: Item) => void;
}

export interface ButtonColumn<Item> extends BaseColumn<Item> {
  type: 'button';
  buttonText: string;
  variant?: 'primary' | 'destructive' | 'outline' | 'ghost' | 'link';
  onClick: (item: Item) => void;
}

export interface CopyColumnLabels {
  copyTooltip?: string;
  copiedTooltip?: string;
}

export interface CopyColumn<Item> extends BaseColumn<Item> {
  type: 'copy';
}

export interface BadgeColumn<Item> extends BaseColumn<Item> {
  type: 'badge';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
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
  | BadgeColumn<Item>
  | ActionsColumn<Item>
  | CustomColumn<Item>;

export interface EmptyStateProps {
  title: string;
  subtitle?: string;
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

const ALIGNMENT_CLASSES = {
  text: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  },
  flex: {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  },
} as const;

const isEmpty = (value: unknown): boolean => {
  return value === null || value === undefined || value === '';
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

const DEFAULT_COPY_LABELS: Required<CopyColumnLabels> = {
  copyTooltip: 'Copy to clipboard',
  copiedTooltip: 'Copied!',
};

function CopyButton({
  value,
  labels = DEFAULT_COPY_LABELS,
}: {
  value: unknown;
  labels?: CopyColumnLabels;
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

  return (
    <InlineCode className="w-full flex items-center justify-between gap-2 pr-1">
      <span className="truncate text-muted-foreground">{String(value)}</span>

      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-muted/50 shrink-0"
            aria-label={copied ? labels.copiedTooltip : labels.copyTooltip}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? labels.copiedTooltip : labels.copyTooltip}</p>
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

  return <span className="text-muted-foreground">{String(value)}</span>;
}

function renderDateColumn<Item>(
  item: Item,
  value: Date | string | number,
  column: DateColumn<Item>,
): React.ReactNode {
  if (column.render) {
    return column.render(item, value);
  }
  const formattedDate = formatDate(value, column.format);

  return (
    <span className="text-muted-foreground" title={new Date(value).toISOString()}>
      {formattedDate}
    </span>
  );
}

function renderSwitchColumn<Item>(
  item: Item,
  value: boolean,
  column: SwitchColumn<Item>,
): React.ReactNode {
  const handleToggle = (checked: boolean) => {
    column.onToggle?.(checked, item);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Switch checked={!!value} onCheckedChange={handleToggle} />
    </div>
  );
}

function renderButtonColumn<Item>(item: Item, column: ButtonColumn<Item>): React.ReactNode {
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

function renderBadgeColumn<Item>(value: unknown, column: BadgeColumn<Item>): React.ReactNode {
  return <Badge variant={column.variant}>{String(value)}</Badge>;
}

function renderCopyColumn(value: unknown): React.ReactNode {
  return <CopyButton value={value} />;
}

function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-md font-medium text-foreground mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}
      {action && (
        <Button variant={action.variant} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function DataTable<Item>({
  data,
  columns,
  loading = false,
  loader,
  emptyState,
  onRowClick,
  className,
  headerAlign = 'left',
}: DataTableProps<Item>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableColumns = useMemo<ColumnDef<Item>[]>(() => {
    return columns.map((column, index) => {
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
          headerAlign: column.headerAlign || headerAlign || 'left',
          column: column,
        },

        cell: ({ getValue, row }) => {
          const value = getValue();
          const item = row.original;

          if (column.type === 'actions') {
            return <div onClick={(e) => e.stopPropagation()}>{column.render(item)}</div>;
          }

          if (column.type === 'custom') {
            return <>{column.render(item, value)}</>;
          }

          if (column.type === 'switch') {
            return renderSwitchColumn(item, value as boolean, column);
          }

          if (column.type === 'button') {
            return renderButtonColumn(item, column);
          }

          if (isEmpty(value)) {
            return null;
          }

          switch (column.type) {
            case 'text':
              return renderTextColumn(item, value, column);
            case 'date':
              return renderDateColumn(item, value as Date | string | number, column);
            case 'copy':
              return renderCopyColumn(value);
            case 'badge':
              return renderBadgeColumn(value, column);
            default:
              return <span className="text-foreground">{String(value)}</span>;
          }
        },
      };
    });
  }, [columns, headerAlign]);

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
                      canSort && 'hover:bg-muted/50',
                      'transition-colors',
                      ALIGNMENT_CLASSES.text[meta.headerAlign],
                    )}
                    style={{
                      width: meta.column.width,
                      minWidth: meta.column.width,
                      maxWidth: meta.column.width,
                    }}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    isSortable={canSort}
                    sortDirection={sortDirection}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow disableHover>
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
                        width: meta.column.width,
                        minWidth: meta.column.width,
                        maxWidth: meta.column.width,
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
