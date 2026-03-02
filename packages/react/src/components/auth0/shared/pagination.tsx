/**
 * Pagination navigation component.
 * @module pagination
 * @internal
 */

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import * as React from 'react';

import type { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Pagination container component.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

/**
 * Pagination content wrapper.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

/**
 * Single pagination item wrapper.
 * @param props - Component props
 * @returns JSX element
 */
function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

/**
 * Pagination link component.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @param props.isActive - Whether the component is in an active state
 * @param props.size - Size variant of the component
 * @returns JSX element
 */
function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

/**
 * Previous page navigation button.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @param props.label - The label text
 * @returns JSX element
 */
function PaginationPrevious({
  className,
  label = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block text-foreground">{label}</span>
    </PaginationLink>
  );
}

/**
 * Next page navigation button.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @param props.label - The label text
 * @returns JSX element
 */
function PaginationNext({
  className,
  label = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block text-foreground">{label}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

/**
 * Ellipsis indicator for pagination overflow.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
