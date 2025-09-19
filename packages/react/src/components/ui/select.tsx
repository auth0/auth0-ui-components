import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/theme-utils';

const SelectContext = React.createContext<{
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  focusedIndex?: number;
  setFocusedIndex?: (index: number) => void;
  handleTypeahead?: (key: string) => void;
  registerOption?: (value: string, label: string) => void;
  unregisterOption?: (value: string) => void;
  getOptions?: () => Array<{ label: string; value: string }>;
  id?: string;
} | null>(null);

const Select = ({
  value,
  onValueChange,
  defaultValue,
  children,
  name,
  id,
  ...props
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  name?: string;
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [typeahead, setTypeahead] = React.useState('');

  const optionsRef = React.useRef<Array<{ label: string; value: string }>>([]);
  const typeaheadTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentValue = value ?? internalValue;

  const registerOption = React.useCallback((value: string, label: string) => {
    const existing = optionsRef.current.find((opt) => opt.value === value);
    if (existing) {
      optionsRef.current = optionsRef.current.map((opt) =>
        opt.value === value ? { value, label } : opt,
      );
    } else {
      optionsRef.current = [...optionsRef.current, { value, label }];
    }
  }, []);

  const unregisterOption = React.useCallback((value: string) => {
    optionsRef.current = optionsRef.current.filter((opt) => opt.value !== value);
  }, []);

  const getOptions = React.useCallback(() => optionsRef.current, []);

  React.useEffect(() => {
    if (isOpen && optionsRef.current.length > 0) {
      const selectedIndex = optionsRef.current.findIndex((option) => option.value === currentValue);
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen, currentValue]);

  const handleTypeahead = React.useCallback(
    (key: string) => {
      const options = optionsRef.current;
      if (!options || options.length === 0) return;

      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }

      const newTypeahead = typeahead + key.toLowerCase();
      setTypeahead(newTypeahead);

      const matchingIndex = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(newTypeahead),
      );

      if (matchingIndex !== -1) {
        if (isOpen) {
          setFocusedIndex(matchingIndex);
        } else {
          setIsOpen(true);
          setFocusedIndex(matchingIndex);
        }
      }

      typeaheadTimeoutRef.current = setTimeout(() => {
        setTypeahead('');
      }, 500);
    },
    [typeahead, isOpen],
  );

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onChange: (val) => {
          setInternalValue(val);
          onValueChange?.(val);
          setIsOpen(false);
          setFocusedIndex(-1);
        },
        name,
        onOpenChange: setIsOpen,
        isOpen,
        focusedIndex,
        setFocusedIndex,
        handleTypeahead,
        registerOption,
        unregisterOption,
        getOptions,
        id,
      }}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative" data-slot="select" {...props}>
          {children}
        </div>
      </Popover>
    </SelectContext.Provider>
  );
};

const SelectGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div data-slot="select-group" className={className} {...props} />;
};

const SelectValue = ({
  placeholder,
  className,
  ...props
}: {
  placeholder?: string;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  const selectedValue = context.value;
  const options = context.getOptions?.() || [];
  const selectedLabel = selectedValue && options.find((opt) => opt.value === selectedValue)?.label;

  return (
    <span data-slot="select-value" className={className} {...props}>
      {selectedLabel || placeholder}
    </span>
  );
};

const SelectTrigger = ({
  placeholder,
  disabled,
  error,
  icon,
  className,
  size = 'default',
  children,
  ...props
}: {
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default';
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  const selectedValue = context.value;
  const options = context.getOptions?.() || [];
  const selectedLabel = selectedValue && options.find((opt) => opt.value === selectedValue)?.label;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    const { key } = event;
    const { isOpen, focusedIndex, setFocusedIndex, onOpenChange, onChange, handleTypeahead } =
      context;
    const options = context.getOptions?.() || [];

    if (!options || options.length === 0) return;

    switch (key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!isOpen) {
          onOpenChange?.(true);
        } else {
          const currentIndex = focusedIndex ?? -1;
          const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          setFocusedIndex?.(nextIndex);
        }
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        if (!isOpen) {
          onOpenChange?.(true);
        } else {
          const currentIndex = focusedIndex ?? -1;
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          setFocusedIndex?.(prevIndex);
        }
        break;
      }

      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!isOpen) {
          onOpenChange?.(true);
        } else if (
          focusedIndex !== undefined &&
          focusedIndex >= 0 &&
          focusedIndex < options.length
        ) {
          onChange?.(options[focusedIndex].value);
        }
        break;
      }

      case 'Escape': {
        event.preventDefault();
        onOpenChange?.(false);
        break;
      }

      case 'Tab': {
        if (isOpen) {
          onOpenChange?.(false);
        }
        break;
      }

      default: {
        if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          event.preventDefault();
          handleTypeahead?.(key);
        }
        break;
      }
    }
  };

  return (
    <PopoverTrigger>
      <Button
        variant={error ? 'destructive' : 'outline'}
        disabled={disabled}
        onClick={() => context.onOpenChange?.(!context.isOpen)}
        onKeyDown={handleKeyDown}
        data-slot="select-trigger"
        data-size={size}
        className={cn(
          'border-border/25 text-input-foreground shadow-input-resting hover:shadow-input-hover hover:border-border/0 focus-within:outline-primary focus-within:shadow-input-hover bg-input disabled:bg-muted flex w-full justify-between px-3 ring-4 ring-transparent outline-4 disabled:cursor-not-allowed',
          context.isOpen && 'focus-within:outline-primary focus-within:shadow-input-hover',
          className,
        )}
        id={context.id}
        {...props}
      >
        {icon && (
          <div className="text-primary absolute top-1/2 left-3 -translate-y-1/2">{icon}</div>
        )}
        {children || (
          <span className={cn('text-primary block truncate')}>{selectedLabel || placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            'text-primary size-4 transition-transform duration-200',
            context.isOpen && 'rotate-180',
          )}
        />
      </Button>
    </PopoverTrigger>
  );
};

const SelectContent = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (context.isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [context.isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;
    const { focusedIndex, setFocusedIndex, onChange, onOpenChange, handleTypeahead, getOptions } =
      context;
    const options = getOptions?.() || [];

    if (!options || options.length === 0) return;

    switch (key) {
      case 'ArrowDown': {
        event.preventDefault();
        const currentIndex = focusedIndex ?? -1;
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        setFocusedIndex?.(nextIndex);
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        const prevCurrentIndex = focusedIndex ?? -1;
        const prevIndex = prevCurrentIndex > 0 ? prevCurrentIndex - 1 : options.length - 1;
        setFocusedIndex?.(prevIndex);
        break;
      }

      case 'Enter': {
        event.preventDefault();
        if (focusedIndex !== undefined && focusedIndex >= 0 && focusedIndex < options.length) {
          onChange?.(options[focusedIndex].value);
        }
        break;
      }

      case 'Escape': {
        event.preventDefault();
        onOpenChange?.(false);
        break;
      }

      default: {
        if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          event.preventDefault();
          handleTypeahead?.(key);
        }
        break;
      }
    }
  };

  return (
    <PopoverContent className={cn('w-[var(--trigger-width)] p-1 outline-none', className)}>
      <div
        ref={contentRef}
        data-slot="select-content"
        tabIndex={0}
        role="listbox"
        onKeyDown={handleKeyDown}
        className="outline-none"
        {...props}
      >
        {children}
      </div>
    </PopoverContent>
  );
};

const SelectLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
};

const SelectItem = ({
  value,
  children,
  className,
  ...props
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  React.useEffect(() => {
    const label = typeof children === 'string' ? children : value;
    context.registerOption?.(value, label);

    return () => {
      context.unregisterOption?.(value);
    };
  }, [value, children, context.registerOption, context.unregisterOption]);

  const isSelected = value === context.value;
  const options = context.getOptions?.() || [];
  const itemIndex = options.findIndex((opt) => opt.value === value);
  const isFocused = itemIndex === context.focusedIndex;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      context.onChange?.(value);
    }
  };

  return (
    <button
      type="button"
      onClick={() => context.onChange?.(value)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (itemIndex >= 0) {
          context.setFocusedIndex?.(itemIndex);
        }
      }}
      data-slot="select-item"
      className={cn(
        'hover:bg-muted/50 focus:bg-muted relative flex w-full items-center justify-between rounded-2xl px-2 py-1.5 text-sm outline-hidden select-none',
        isSelected && 'bg-muted',
        isFocused && 'bg-muted/75',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {isSelected && <Check className="text-primary size-4" />}
    </button>
  );
};

const SelectSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
};

const SelectScrollUpButton = ({
  className,
  ...props
}: {
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUp className="size-4" />
    </button>
  );
};

const SelectScrollDownButton = ({
  className,
  ...props
}: {
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDown className="size-4" />
    </button>
  );
};

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
