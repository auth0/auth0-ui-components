'use client';

import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/theme-utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within DropdownMenu');
  }
  return context;
}

interface DropdownMenuSubContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuSubContext = React.createContext<DropdownMenuSubContextValue | undefined>(
  undefined,
);

function useDropdownMenuSub() {
  const context = React.useContext(DropdownMenuSubContext);
  if (!context) {
    throw new Error('useDropdownMenuSub must be used within DropdownMenuSub');
  }
  return context;
}

function useCloseDropdown() {
  const mainDropdown = React.useContext(DropdownMenuContext);
  const subDropdown = React.useContext(DropdownMenuSubContext);

  return React.useCallback(() => {
    if (subDropdown) {
      subDropdown.setOpen(false);
    }

    if (mainDropdown) {
      mainDropdown.setOpen(false);
    }
  }, [mainDropdown, subDropdown]);
}

interface DropdownMenuProps extends React.ComponentProps<'div'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function DropdownMenu({
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [onOpenChange],
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open || !(event.target instanceof Element)) return;

      const content = document.querySelector('[data-slot="dropdown-menu-content"]');
      const trigger = document.querySelector('[data-slot="dropdown-menu-trigger"]');

      if (
        content &&
        !content.contains(event.target) &&
        trigger &&
        !trigger.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div data-slot="dropdown-menu" {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  children?: React.ReactNode;
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger(componentProps, forwardedRef) {
    const { children, onClick, onMouseDown, asChild = false, ...elementProps } = componentProps;

    const { open, setOpen } = useDropdownMenu();

    const handleMouseDown = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseDown?.(event);

        if (event.button === 0 && !event.ctrlKey) {
          setOpen(!open);

          if (!open) event.preventDefault();
        }
      },
      [onMouseDown, setOpen, open],
    );

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
      },
      [onClick],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (['Enter', ' '].includes(event.key)) {
          event.preventDefault();
          setOpen(!open);
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setOpen(true);
        }
      },
      [setOpen, open],
    );

    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;

      const cloneProps: Record<string, unknown> = {
        ...childProps,
        ...elementProps,
        'data-slot': 'dropdown-menu-trigger',
        'data-state': open ? 'open' : 'closed',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        ref: forwardedRef,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (typeof childProps.onClick === 'function') {
            (childProps.onClick as (e: React.MouseEvent<HTMLButtonElement>) => void)(e);
          }
          handleClick(e);
        },
        onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (typeof childProps.onMouseDown === 'function') {
            (childProps.onMouseDown as (e: React.MouseEvent<HTMLButtonElement>) => void)(e);
          }
          handleMouseDown(e);
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (typeof childProps.onKeyDown === 'function') {
            (childProps.onKeyDown as (e: React.KeyboardEvent<HTMLButtonElement>) => void)(e);
          }
          handleKeyDown(e);
        },
      };

      return React.cloneElement(children, cloneProps);
    }

    return (
      <Button
        {...elementProps}
        ref={forwardedRef as React.RefObject<HTMLButtonElement>}
        data-slot="dropdown-menu-trigger"
        data-state={open ? 'open' : 'closed'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Button>
    );
  },
);

function DropdownMenuPortal({
  children,
  container,
}: {
  children: React.ReactNode;
  container?: HTMLElement;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, container || document.body);
}

interface DropdownMenuContentProps extends React.ComponentProps<'div'> {
  sideOffset?: number;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !contentRef.current) return;

    const trigger = document.querySelector('[data-slot="dropdown-menu-trigger"]') as HTMLElement;
    const content = contentRef.current;

    if (trigger) {
      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();

      let top = triggerRect.bottom + sideOffset;
      let left = triggerRect.left;

      if (top + contentRect.height > window.innerHeight) {
        top = triggerRect.top - contentRect.height - sideOffset;
      }

      if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 8;
      }

      content.style.top = `${top}px`;
      content.style.left = `${left}px`;
    }

    const firstFocusable = content.querySelector(
      '[data-slot="dropdown-menu-item"]:not([disabled])',
    ) as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(
        content.querySelectorAll('[data-slot="dropdown-menu-item"]:not([disabled])'),
      ) as HTMLElement[];

      if (e.key === 'Tab') {
        const currentIndex = items.findIndex((item) => item === document.activeElement);

        if (e.shiftKey) {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
        } else {
          e.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
        }
        return;
      }

      const currentIndex = items.findIndex((item) => item === document.activeElement);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
          break;
        }
        case 'Home':
          e.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    };

    const handleFocusOutside = (e: FocusEvent) => {
      if (!content.contains(e.target as Node)) {
        e.preventDefault();
        const items = Array.from(
          content.querySelectorAll('[data-slot="dropdown-menu-item"]:not([disabled])'),
        ) as HTMLElement[];
        items[0]?.focus();
      }
    };

    content.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusOutside);

    return () => {
      content.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusOutside);
    };
  }, [open, sideOffset]);

  return (
    <DropdownMenuPortal>
      <div
        className="fixed inset-0 z-40"
        style={{ display: open ? 'block' : 'none' }}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        data-slot="dropdown-menu-content"
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'bg-popover text-popover-foreground shadow-bevel-xl fixed z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-2xl p-1',
          open
            ? 'animate-in fade-in-0 zoom-in-95'
            : 'animate-out fade-out-0 zoom-out-95 pointer-events-none',
          className,
        )}
        style={{ display: open ? 'block' : 'none' }}
        {...props}
      >
        {children}
      </div>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dropdown-menu-group" className={className} {...props} />;
}

interface DropdownMenuItemProps extends React.ComponentProps<'button'> {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  onClick,
  disabled,
  ...props
}: DropdownMenuItemProps) {
  const closeDropdown = useCloseDropdown();

  return (
    <button
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-muted hover:bg-muted/50 focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        closeDropdown();
      }}
      {...props}
    />
  );
}

interface DropdownMenuCheckboxItemProps extends React.ComponentProps<'button'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const closeDropdown = useCloseDropdown();

  return (
    <button
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-muted focus:text-accent-foreground hover:bg-muted/50 relative flex w-full cursor-default items-center gap-2 rounded-xl py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={() => {
        onCheckedChange?.(!checked);
        closeDropdown();
      }}
      {...props}
    >
      <span className="text-primary pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </button>
  );
}

interface DropdownMenuRadioGroupProps extends React.ComponentProps<'div'> {
  value?: string;
  onValueChange?: (value: string) => void;
}

interface DropdownMenuRadioItemChildProps {
  value?: string;
  checked?: boolean;
  onSelect?: () => void;
}

function DropdownMenuRadioGroup({
  children,
  value,
  onValueChange,
  ...props
}: DropdownMenuRadioGroupProps) {
  return (
    <div data-slot="dropdown-menu-radio-group" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<DropdownMenuRadioItemChildProps>(child)) {
          const childProps = child.props;
          if (childProps.value) {
            return React.cloneElement(child, {
              checked: childProps.value === value,
              onSelect: () => onValueChange?.(childProps.value!),
            });
          }
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuRadioItemProps extends React.ComponentProps<'button'> {
  checked?: boolean;
  onSelect?: () => void;
}

function DropdownMenuRadioItem({
  className,
  children,
  checked,
  onSelect,
  ...props
}: DropdownMenuRadioItemProps) {
  const closeDropdown = useCloseDropdown();

  return (
    <button
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-muted hover:bg-muted/50 focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-xl py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={() => {
        onSelect?.();
        closeDropdown();
      }}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </button>
  );
}

interface DropdownMenuLabelProps extends React.ComponentProps<'div'> {
  inset?: boolean;
}

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'text-muted-foreground px-2 py-1 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn('bg-border mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  );
}

function DropdownMenuSub({ children, ...props }: React.ComponentProps<'div'>) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open || !(event.target instanceof Element)) return;

      const subContent = document.querySelector('[data-slot="dropdown-menu-sub-content"]');
      const subTrigger = triggerRef.current;

      if (
        subContent &&
        !subContent.contains(event.target) &&
        subTrigger &&
        !subTrigger.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuSubContext.Provider value={{ open, setOpen, triggerRef }}>
      <div data-slot="dropdown-menu-sub" {...props}>
        {children}
      </div>
    </DropdownMenuSubContext.Provider>
  );
}

interface DropdownMenuSubTriggerProps extends React.ComponentProps<'button'> {
  inset?: boolean;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenuSub();
  const hoverTimeoutRef = React.useRef<number | undefined>(undefined);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setOpen(true);
    }, 100);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as Element | null;
    const subContent = document.querySelector('[data-slot="dropdown-menu-sub-content"]');

    if (subContent && relatedTarget && subContent.contains(relatedTarget)) {
      clearTimeout(hoverTimeoutRef.current);
      return;
    }

    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setOpen(true);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setOpen(!open);
        break;
    }
  };

  React.useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <button
      ref={triggerRef}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'focus:bg-muted hover:bg-muted/50 focus:text-accent-foreground data-[state=open]:bg-muted/50 data-[state=open]:text-accent-foreground flex w-full cursor-default items-center rounded-xl px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8',
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </button>
  );
}

interface DropdownMenuSubContentProps extends React.ComponentProps<'div'> {
  sideOffset?: number;
}

function DropdownMenuSubContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: DropdownMenuSubContentProps) {
  const { open, triggerRef, setOpen } = useDropdownMenuSub();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!open || !contentRef.current || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const content = contentRef.current;

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    let left = triggerRect.right + sideOffset - 4;
    let top = triggerRect.top - 4;

    if (left + contentRect.width > window.innerWidth) {
      left = triggerRect.left - contentRect.width - sideOffset;
    }

    if (top + contentRect.height > window.innerHeight) {
      top = window.innerHeight - contentRect.height - 8;
    }

    if (top < 8) {
      top = 8;
    }

    content.style.top = `${top}px`;
    content.style.left = `${left}px`;

    const firstFocusable = content.querySelector(
      '[data-slot="dropdown-menu-item"]:not([disabled])',
    ) as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(
        content.querySelectorAll('[data-slot="dropdown-menu-item"]:not([disabled])'),
      ) as HTMLElement[];
      const currentIndex = items.findIndex((item) => item === document.activeElement);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
          break;
        }
        case 'ArrowLeft':
          e.preventDefault();
          setOpen(false);
          trigger.focus();
          break;
        case 'Home':
          e.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    };

    content.addEventListener('keydown', handleKeyDown);
    return () => content.removeEventListener('keydown', handleKeyDown);
  }, [open, sideOffset, setOpen]);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <DropdownMenuPortal>
      <div
        ref={contentRef}
        data-slot="dropdown-menu-sub-content"
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'bg-popover text-popover-foreground shadow-bevel-2xl fixed z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-2xl p-1',
          open
            ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-left-10'
            : 'animate-out fade-out-0 zoom-out-95 pointer-events-none',
          className,
        )}
        style={{ display: open ? 'block' : 'none' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    </DropdownMenuPortal>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
