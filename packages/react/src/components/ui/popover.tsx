'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/theme-utils';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  triggerRect: DOMRect | null;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover');
  }
  return context;
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (newOpen && triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
      setUncontrolledOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !triggerRef.current?.contains(event.target as Node) &&
        !contentRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevent background scrolling when popover is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        // Restore scrolling when popover is closed
        document.body.style.overflow = '';
      };
    }
  }, [open, setOpen]);

  const contextValue: PopoverContextValue = {
    open,
    setOpen,
    triggerRef,
    contentRef,
    triggerRect,
  };

  return (
    <PopoverContext.Provider value={contextValue} data-slot="popover">
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  asChild?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

function PopoverTrigger({ className, onClick, asChild, children, ...props }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef } = usePopoverContext();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    setOpen(!open);
  };

  const isChildButton =
    React.isValidElement(children) &&
    (children.type === 'button' ||
      (typeof children.type === 'function' &&
        (children.type.name === 'Button' ||
          ('displayName' in children.type && children.type.displayName === 'Button') ||
          children.type.name?.toLowerCase().includes('button'))) ||
      (React.isValidElement(children) &&
        children.props &&
        typeof children.props === 'object' &&
        'role' in children.props &&
        children.props.role === 'button') ||
      (children.props &&
        typeof children.props === 'object' &&
        'type' in children.props &&
        children.props.type === 'button'));

  const shouldUseAsChild = asChild || isChildButton;

  if (shouldUseAsChild) {
    if (!React.isValidElement(children)) {
      throw new Error('PopoverTrigger: asChild requires a valid React element as child');
    }

    return React.cloneElement(children as React.ReactElement, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ref: triggerRef as React.Ref<HTMLElement | null> | undefined,
      'data-slot': 'popover-trigger',
      'data-state': open ? 'open' : 'closed',
      onClick: handleClick,
      className: cn(
        React.isValidElement(children) &&
          children.props &&
          typeof children.props === 'object' &&
          'className' in children.props
          ? (children.props as React.HTMLAttributes<HTMLElement>).className
          : undefined,
      ),
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      data-slot="popover-trigger"
      data-state={open ? 'open' : 'closed'}
      className={cn('inline-flex', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

function PopoverContent({
  children,
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const { open, contentRef, triggerRect } = usePopoverContext();

  React.useEffect(() => {
    if (open && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      } else {
        contentRef.current.focus();
      }
    }
  }, [open, contentRef]);

  if (!open || !triggerRect) return null;

  const { top, left, width, height } = triggerRect;

  const cssProps = {
    '--trigger-top': `${top}px`,
    '--trigger-left': `${left}px`,
    '--trigger-width': `${width}px`,
    '--trigger-height': `${height}px`,
    '--side-offset': `${sideOffset}px`,
  } as React.CSSProperties;

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';

    const sideClasses = {
      top: 'bottom-[calc(100vh-var(--trigger-top)+var(--side-offset))]',
      bottom: 'top-[calc(var(--trigger-top)+var(--trigger-height)+var(--side-offset))]',
      left: 'right-[calc(100vw-var(--trigger-left)+var(--side-offset))] top-[var(--trigger-top)]',
      right:
        'left-[calc(var(--trigger-left)+var(--trigger-width)+var(--side-offset))] top-[var(--trigger-top)]',
    };

    const alignClasses = {
      top: {
        start: 'left-[var(--trigger-left)]',
        center: 'left-[calc(var(--trigger-left)+var(--trigger-width)/2)] -translate-x-1/2',
        end: 'right-[calc(100vw-var(--trigger-left)-var(--trigger-width))]',
      },
      bottom: {
        start: 'left-[var(--trigger-left)]',
        center: 'left-[calc(var(--trigger-left)+var(--trigger-width)/2)] -translate-x-1/2',
        end: 'right-[calc(100vw-var(--trigger-left)-var(--trigger-width))]',
      },
      left: {
        start: 'top-[var(--trigger-top)]',
        center: 'top-[calc(var(--trigger-top)+var(--trigger-height)/2)] -translate-y-1/2',
        end: 'bottom-[calc(100vh-var(--trigger-top)-var(--trigger-height))]',
      },
      right: {
        start: 'top-[var(--trigger-top)]',
        center: 'top-[calc(var(--trigger-top)+var(--trigger-height)/2)] -translate-y-1/2',
        end: 'bottom-[calc(100vh-var(--trigger-top)-var(--trigger-height))]',
      },
    };

    return `${baseClasses} ${sideClasses[side]} ${alignClasses[side][align]}`;
  };

  const getOriginClasses = () => {
    const originMap = {
      top: {
        start: 'origin-bottom-left',
        center: 'origin-bottom',
        end: 'origin-bottom-right',
      },
      bottom: {
        start: 'origin-top-left',
        center: 'origin-top',
        end: 'origin-top-right',
      },
      left: {
        start: 'origin-top-right',
        center: 'origin-right',
        end: 'origin-bottom-right',
      },
      right: {
        start: 'origin-top-left',
        center: 'origin-left',
        end: 'origin-bottom-left',
      },
    };

    return originMap[side][align];
  };

  const content = (
    <div
      ref={contentRef}
      data-slot="popover-content"
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      data-align={align}
      tabIndex={-1}
      className={cn(
        'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 shadow-bevel-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-72 overflow-hidden rounded-3xl ring-0 outline-hidden duration-150 ease-in-out outline-none focus:outline-none',
        getPositionClasses(),
        getOriginClasses(),
        className,
      )}
      style={cssProps}
      {...props}
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
}

function PopoverAnchor({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
