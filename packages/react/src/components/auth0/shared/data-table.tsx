/**
 * Data table with sorting and actions.
 * @module data-table
 * @internal
 */

import type { ActionButton as CoreActionButton } from '@auth0/universal-components-core';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { SortingState, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Copy } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { MiddleEllipsisText } from '@/components/auth0/shared/middle-ellipsis-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InlineCode } from '@/components/ui/inline-code';
import { Spinner } from '@/components/ui/spinner';
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
import { cn } from '@/lib/utils';

interface ActionButton extends Omit<CoreActionButton, 'onClick'> {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

type AlignmentType = 'left' | 'center' | 'right';

export interface BaseColumn<Item> {
  title: string | React.ReactNode;
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

export interface DataTableSelectionLabels {
  selectAll: string;
  selectRow: (index: number) => string;
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

export interface DataTableSortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

/**
 * Row-selection cap, as a pair that must be supplied together.
 *
 * Omit both props for unlimited selection. Setting `maxSelectionAllowed` requires
 * `maxSelectionAllowedMessage` so the disabled checkboxes always explain themselves
 * in the caller's locale — `DataTable` is locale-agnostic and supplies no copy of its own.
 */
export type DataTableSelectionLimit =
  | {
      maxSelectionAllowed?: undefined;
      maxSelectionAllowedMessage?: undefined;
    }
  | {
      /** Max rows selectable at once; at the cap, only unchecked boxes disable. */
      maxSelectionAllowed: number;
      /** Tooltip for the disabled checkboxes at the cap. */
      maxSelectionAllowedMessage: string;
    };

export type DataTableProps<Item> = {
  data: Item[];
  columns: Column<Item>[];
  loading?: boolean;
  loader?: React.ReactNode;
  emptyState?: EmptyStateProps;
  onRowClick?: (rowData: Item) => void;
  rowClickLabel?: (index: number) => string;
  className?: string;
  headerAlign?: AlignmentType;
  /** When provided, sorting is delegated to the parent (server-side). */
  onSortChange?: (sortConfig: DataTableSortConfig) => void;
  /** Controlled sort state. Used with onSortChange for server-side sorting. */
  sortConfig?: DataTableSortConfig;
  /** Enable row selection with checkboxes. */
  selectable?: boolean;
  /** Controlled selected rows. */
  selectedRows?: Item[];
  /** Called when selection changes. */
  onSelectedRowsChange?: (rows: Item[]) => void;
  /** Derive a stable string ID from a row for selection tracking. */
  getRowId?: (row: Item) => string;
  /** Accessible labels for selection checkboxes. */
  selectionLabels?: DataTableSelectionLabels;
} & DataTableSelectionLimit;

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

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const DEFAULT_ROW_CLICK_LABEL = (index: number) => `View row ${index + 1}`;

const DEFAULT_SELECTION_LABELS: DataTableSelectionLabels = {
  selectAll: 'Select all rows',
  selectRow: (index: number) => `Select row ${index + 1}`,
};

/**
 * Copy button with clipboard functionality.
 * @param props - Component props.
 * @param props.value - Value to copy
 * @param props.labels - Tooltip labels
 * @returns JSX element
 */
function CopyButton({
  value,
  labels = DEFAULT_COPY_LABELS,
}: {
  value: unknown;
  labels?: CopyColumnLabels;
}) {
  const [copied, setCopied] = useState(false);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const stringValue = String(value);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(stringValue);
      setCopied(true);
      setCopyTooltipOpen(true);

      setTimeout(() => {
        setCopied(false);
        setCopyTooltipOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <InlineCode className="w-full flex items-center justify-between gap-2 pr-1">
      <span className="min-w-0 flex-1">
        <MiddleEllipsisText text={stringValue} className="text-muted-foreground" />
      </span>
      <Tooltip open={copyTooltipOpen} onOpenChange={setCopyTooltipOpen}>
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

/**
 * Renders a text column cell.
 * @param item - Data item.
 * @param value - Cell value.
 * @param column - Column configuration.
 * @returns React node
 */
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

/**
 * Renders a date column cell.
 * @param item - Data item.
 * @param value - Cell value.
 * @param column - Column configuration.
 * @returns React node
 */
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

/**
 * Renders a switch column cell.
 * @param item - Data item.
 * @param value - Cell value.
 * @param column - Column configuration.
 * @returns React node
 */
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

/**
 * Renders a button column cell.
 * @param item - Data item.
 * @param column - Column configuration.
 * @returns React node
 */
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

/**
 * Renders a badge column cell.
 * @param value - Cell value.
 * @param column - Column configuration.
 * @returns React node
 */
function renderBadgeColumn<Item>(value: unknown, column: BadgeColumn<Item>): React.ReactNode {
  return <Badge variant={column.variant}>{String(value)}</Badge>;
}

/**
 * Renders a copy column cell.
 * @param value - Cell value.
 * @returns React node
 */
function renderCopyColumn(value: unknown): React.ReactNode {
  return <CopyButton value={value} />;
}

/**
 * Wraps a checkbox in a selection-limit tooltip, only while disabled.
 * @param disabled - Whether the checkbox is disabled by the selection limit.
 * @param message - Copy shown in the tooltip.
 * @param checkbox - The checkbox to wrap.
 * @returns React node
 */
function withLimitTooltip(
  disabled: boolean,
  message: string,
  checkbox: React.ReactNode,
): React.ReactNode {
  if (!disabled) return checkbox;

  return (
    <Tooltip>
      <TooltipTrigger>
        <span tabIndex={0} className="inline-flex cursor-not-allowed">
          {checkbox}
        </span>
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Empty state component for data table.
 * @param props - Component props.
 * @param props.title - Empty state title.
 * @param props.subtitle - Empty state subtitle.
 * @param props.action - Optional action button config.
 * @returns JSX element
 */
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

/**
 * Generic data table component.
 * @param props - Component props.
 * @param props.data - Table data items.
 * @param props.columns - Column configurations.
 * @param props.loading - Loading state.
 * @param props.loader - Custom loader component.
 * @param props.emptyState - Empty state configuration.
 * @param props.onRowClick - Row click handler.
 * @param props.rowClickLabel - Accessible label for a clickable row.
 * @param props.className - Additional CSS classes.
 * @param props.headerAlign - Default header alignment.
 * @param props.maxSelectionAllowed - Max rows selectable at once.
 * @param props.maxSelectionAllowedMessage - Tooltip for the disabled checkboxes at the cap.
 * @returns JSX element
 */
export function DataTable<Item>({
  data,
  columns,
  loading = false,
  loader,
  emptyState,
  onRowClick,
  rowClickLabel,
  className,
  headerAlign = 'left',
  onSortChange,
  sortConfig,
  selectable = false,
  selectedRows,
  onSelectedRowsChange,
  getRowId,
  selectionLabels,
  maxSelectionAllowed,
  maxSelectionAllowedMessage,
}: DataTableProps<Item>) {
  const isServerSideSort = !!onSortChange;
  const isControlledSelection = selectedRows !== undefined;
  const isRowClickable = !!onRowClick;

  const handleRowClick = (rowData: Item, event: React.MouseEvent<HTMLTableRowElement>) => {
    const focusable = (event.target as HTMLElement).closest<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable && focusable !== event.currentTarget) return;
    onRowClick?.(rowData);
  };

  const handleRowKeyDown = (rowData: Item, event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(rowData);
    }
  };

  const selectionLimit =
    maxSelectionAllowed === undefined ? undefined : Math.max(0, maxSelectionAllowed);

  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  // Convert controlled sortConfig to TanStack SortingState for header display
  const sorting: SortingState = useMemo(() => {
    if (isServerSideSort && sortConfig?.key) {
      return [{ id: sortConfig.key, desc: sortConfig.direction === 'desc' }];
    }
    return internalSorting;
  }, [isServerSideSort, sortConfig, internalSorting]);

  const rowSelection = useMemo<RowSelectionState>(() => {
    if (!selectable) return {};
    if (isControlledSelection && selectedRows) {
      if (getRowId) {
        return Object.fromEntries(selectedRows.map((row) => [getRowId(row), true]));
      }
      return Object.fromEntries(
        data.reduce<[string, boolean][]>((acc, item, idx) => {
          if (selectedRows.includes(item)) acc.push([String(idx), true]);
          return acc;
        }, []),
      );
    }
    return internalRowSelection;
  }, [selectable, isControlledSelection, selectedRows, getRowId, data, internalRowSelection]);

  const selectedCount = useMemo(
    () => Object.values(rowSelection).filter(Boolean).length,
    [rowSelection],
  );
  const isSelectionLimitReached = selectionLimit !== undefined && selectedCount >= selectionLimit;

  const limitMessage = maxSelectionAllowedMessage ?? '';

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;

      if (isServerSideSort) {
        const sort = newSorting[0];
        if (sort) {
          onSortChange({ key: sort.id, direction: sort.desc ? 'desc' : 'asc' });
        } else {
          onSortChange({ key: null, direction: 'asc' });
        }
      } else {
        setInternalSorting(newSorting);
      }
    },
    [isServerSideSort, onSortChange, sorting],
  );

  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      if (!isControlledSelection) setInternalRowSelection(newSelection);
      if (!onSelectedRowsChange) return;
      if (!getRowId) {
        onSelectedRowsChange(data.filter((_, idx) => newSelection[String(idx)]));
        return;
      }

      const byId = new Map<string, Item>();
      for (const row of selectedRows ?? []) byId.set(getRowId(row), row);
      for (const item of data) byId.set(getRowId(item), item);

      onSelectedRowsChange(
        Object.entries(newSelection)
          .filter(([, isSelected]) => isSelected)
          .reduce<Item[]>((items, [id]) => {
            const item = byId.get(id);
            if (item) items.push(item);
            return items;
          }, []),
      );
    },
    [rowSelection, isControlledSelection, onSelectedRowsChange, getRowId, data, selectedRows],
  );

  const selectionColumn = useMemo<ColumnDef<Item>>(
    () => ({
      id: '__selection__',
      enableSorting: false,
      size: 48,
      meta: {
        headerAlign: 'left' as AlignmentType,
        column: {
          type: 'actions',
          title: '',
          width: '48px',
          enableSorting: false,
          render: () => null,
        } as unknown as Column<Item>,
      },
      header: ({ table: t }) => {
        const isSelectAllDisabled = selectionLimit === 0;

        const handleSelectAll = (checked: boolean) => {
          if (!checked) {
            if (selectionLimit !== undefined && isSelectionLimitReached) {
              handleRowSelectionChange({});
            } else {
              t.toggleAllPageRowsSelected(false);
            }
            return;
          }
          if (selectionLimit === undefined) {
            t.toggleAllPageRowsSelected(true);
            return;
          }

          const alreadySelectedIds = Object.entries(rowSelection)
            .filter(([, isSelected]) => isSelected)
            .map(([id]) => id);
          const pageRowIds = t.getRowModel().rows.map((r) => r.id);
          const ordered = new Set([...alreadySelectedIds, ...pageRowIds]);

          handleRowSelectionChange(
            Object.fromEntries(
              [...ordered].slice(0, selectionLimit).map((id) => [id, true] as const),
            ),
          );
        };

        return withLimitTooltip(
          isSelectAllDisabled,
          limitMessage,
          <Checkbox
            className={cn(isSelectAllDisabled && 'pointer-events-none')}
            checked={
              isSelectionLimitReached || t.getIsAllPageRowsSelected()
                ? true
                : t.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
            disabled={isSelectAllDisabled}
            aria-label={selectionLabels?.selectAll ?? DEFAULT_SELECTION_LABELS.selectAll}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />,
        );
      },
      cell: ({ row }) => {
        const isRowDisabled = isSelectionLimitReached && !row.getIsSelected();

        return withLimitTooltip(
          isRowDisabled,
          limitMessage,
          <Checkbox
            className={cn(isRowDisabled && 'pointer-events-none')}
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => {
              if (checked && isRowDisabled) return;
              row.toggleSelected(!!checked);
            }}
            disabled={isRowDisabled}
            aria-label={
              selectionLabels?.selectRow(row.index) ?? DEFAULT_SELECTION_LABELS.selectRow(row.index)
            }
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />,
        );
      },
    }),
    [
      selectionLabels,
      isSelectionLimitReached,
      selectionLimit,
      selectedCount,
      rowSelection,
      limitMessage,
      handleRowSelectionChange,
    ],
  );

  const tableColumns = useMemo<ColumnDef<Item>[]>(() => {
    const dataCols: ColumnDef<Item>[] = columns.map((column, index) => {
      return {
        id: column.accessorKey ? String(column.accessorKey) : `column-${index}`,
        accessorKey: column.accessorKey as string,
        header:
          typeof column.title === 'string' ? column.title : () => column.title as React.ReactNode,
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
    return selectable ? [selectionColumn, ...dataCols] : dataCols;
  }, [columns, headerAlign, selectable, selectionColumn]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      ...(selectable && { rowSelection }),
    },
    getRowId: getRowId,
    onSortingChange: handleSortingChange,
    ...(selectable && { onRowSelectionChange: handleRowSelectionChange }),
    enableRowSelection: selectable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServerSideSort ? undefined : getSortedRowModel(),
    manualSorting: isServerSideSort,
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
              <TableCell colSpan={tableColumns.length}>
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
                  isRowClickable &&
                    'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  'transition-colors',
                )}
                {...(isRowClickable && {
                  tabIndex: 0,
                  'aria-label': (rowClickLabel ?? DEFAULT_ROW_CLICK_LABEL)(row.index),
                  onClick: (event: React.MouseEvent<HTMLTableRowElement>) =>
                    handleRowClick(row.original, event),
                  onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) =>
                    handleRowKeyDown(row.original, event),
                })}
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
