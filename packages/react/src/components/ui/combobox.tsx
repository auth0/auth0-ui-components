import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { cn } from '@/lib/utils';
import { usePortalContainer } from '@/providers/portal-context';

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface ComboboxProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  options: ComboboxOption[];
  disabled?: boolean;
  className?: string;
  notFoundMessage?: string;
  multiple?: boolean;
  showSelectedCount?: boolean;
}

export function Combobox({
  value,
  onChange,
  onInputChange,
  placeholder = 'Select option...',
  options = [],
  disabled,
  className,
  notFoundMessage,
  multiple = false,
  showSelectedCount = false,
}: ComboboxProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [hasTyped, setHasTyped] = React.useState(false);
  const [focusedChipIndex, setFocusedChipIndex] = React.useState(-1);
  const [isFocused, setIsFocused] = React.useState(false);
  const [visibleChipCount, setVisibleChipCount] = React.useState(1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chipRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const measureRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const measureBadgeRef = React.useRef<HTMLSpanElement>(null);
  const chipsContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const portalContainer = usePortalContainer();
  const reactId = React.useId();
  const inputId = `combobox-input-${reactId}`;

  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const dialogContent = containerRef.current?.closest<HTMLElement>(
      '[data-slot="dialog-content"]',
    );
    setPopoverContainer(dialogContent ?? portalContainer);
  }, [open, portalContainer]);

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value] : [];
  }, [value, multiple]);

  const selectedOptions = React.useMemo(
    () => options.filter((opt) => selectedValues.includes(opt.value)),
    [options, selectedValues],
  );

  const filteredOptions = React.useMemo(() => {
    if (!hasTyped || query === '') return options;
    return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query, hasTyped]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newQuery = event.target.value;
    setQuery(newQuery);
    setOpen(true);
    setHasTyped(true);
    setFocusedIndex(-1);
    onInputChange?.(newQuery);

    if (!multiple && selectedOptions.length > 0 && newQuery !== selectedOptions[0]?.label) {
      onChange?.(newQuery);
    }
  };

  const handleOptionSelect = (option: ComboboxOption) => {
    if (disabled) return;

    if (multiple) {
      const isSelected = selectedValues.includes(option.value);
      const newValues = isSelected
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];

      onChange?.(newValues as string[]);

      setFocusedIndex(-1);
    } else {
      setQuery(option.label);
      setOpen(false);
      setHasTyped(false);
      setFocusedIndex(-1);
      onChange?.(option.value);
    }
  };

  const handleChipRemove = (valueToRemove: string, refocusInput = true) => {
    if (disabled) return;

    if (multiple) {
      const newValues = selectedValues.filter((v) => v !== valueToRemove);
      onChange?.(newValues as string[]);
      if (refocusInput) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
  };

  const handleChipKeyDown = (event: React.KeyboardEvent, chipIndex: number) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (chipIndex > 0) {
          const prevIndex = chipIndex - 1;
          setFocusedChipIndex(prevIndex);
          chipRefs.current[prevIndex]?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (chipIndex < selectedOptions.length - 1) {
          const nextIndex = chipIndex + 1;
          setFocusedChipIndex(nextIndex);
          chipRefs.current[nextIndex]?.focus();
        } else {
          setFocusedChipIndex(-1);
          inputRef.current?.focus();
        }
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        if (selectedOptions[chipIndex]) {
          handleChipRemove(selectedOptions[chipIndex].value, false);
        }
        if (selectedOptions.length > 1) {
          if (chipIndex === 0) {
            setFocusedChipIndex(0);
            setTimeout(() => chipRefs.current[0]?.focus(), 0);
          } else if (chipIndex >= selectedOptions.length - 1) {
            const newLastIndex = selectedOptions.length - 2;
            setFocusedChipIndex(newLastIndex);
            setTimeout(() => chipRefs.current[newLastIndex]?.focus(), 0);
          } else {
            setFocusedChipIndex(chipIndex);
            setTimeout(() => chipRefs.current[chipIndex]?.focus(), 0);
          }
        } else {
          setFocusedChipIndex(-1);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedOptions[chipIndex]) {
          handleChipRemove(selectedOptions[chipIndex].value);
        }
        break;
    }
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (!open) {
      setHasTyped(false);
    }
    setFocusedChipIndex(-1);
    setOpen(!open);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (event: React.FocusEvent) => {
    if (containerRef.current && containerRef.current.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    setFocusedChipIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setHasTyped(false);
        } else {
          setFocusedIndex((prev) => (prev + 1) % filteredOptions.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (open) {
          setFocusedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        }
        break;
      case 'ArrowLeft':
        if (multiple && selectedOptions.length > 0) {
          event.preventDefault();
          if (focusedChipIndex === -1) {
            const lastChipIndex = selectedOptions.length - 1;
            setFocusedChipIndex(lastChipIndex);
            chipRefs.current[lastChipIndex]?.focus();
          } else if (focusedChipIndex > 0) {
            const prevIndex = focusedChipIndex - 1;
            setFocusedChipIndex(prevIndex);
            chipRefs.current[prevIndex]?.focus();
          }
        }
        break;
      case 'ArrowRight':
        if (multiple && selectedOptions.length > 0) {
          event.preventDefault();
          if (focusedChipIndex > -1 && focusedChipIndex < selectedOptions.length - 1) {
            const nextIndex = focusedChipIndex + 1;
            setFocusedChipIndex(nextIndex);
            chipRefs.current[nextIndex]?.focus();
          } else if (focusedChipIndex >= selectedOptions.length - 1) {
            setFocusedChipIndex(-1);
            inputRef.current?.focus();
          }
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (open && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionSelect(filteredOptions[focusedIndex]);
        }
        break;
      case 'Backspace':
        if (multiple && selectedOptions.length > 0 && inputRef.current?.value === '') {
          event.preventDefault();
          const lastOption = selectedOptions[selectedOptions.length - 1];
          if (lastOption) {
            handleChipRemove(lastOption.value);
          }
        } else if (!multiple && selectedOptions.length > 0 && inputRef.current?.value === '') {
          // Allow clearing selection in single-select mode when input is empty
          event.preventDefault();
          onChange?.('');
          setQuery('');
          setHasTyped(false);
        }
        break;
      case 'Escape':
        setOpen(false);
        setHasTyped(false);
        setFocusedIndex(-1);
        setFocusedChipIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setOpen(false);
        setHasTyped(false);
        setFocusedIndex(-1);
        setFocusedChipIndex(-1);
        break;
    }
  };

  React.useEffect(() => {
    if (!multiple && selectedOptions.length > 0 && selectedOptions[0]) {
      setQuery(selectedOptions[0].label);
    } else if (multiple || selectedOptions.length === 0) {
      setQuery('');
    }
  }, [selectedOptions, multiple]);

  React.useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredOptions]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  React.useEffect(() => {
    chipRefs.current = chipRefs.current.slice(0, selectedOptions.length);
  }, [selectedOptions.length]);

  const showAllChips = isFocused || open || !showSelectedCount;

  React.useLayoutEffect(() => {
    if (!multiple || showAllChips) return;
    if (!containerRef.current || selectedOptions.length === 0) {
      setVisibleChipCount(1);
      return;
    }

    const measureVisible = () => {
      // Every dimension is read from the live DOM so nothing drifts from the styles.
      const textFieldEl = inputRef.current?.closest('.group') as HTMLElement | null;
      if (!textFieldEl) return;

      const fieldStyles = window.getComputedStyle(textFieldEl);
      const paddingX = parseFloat(fieldStyles.paddingLeft) + parseFloat(fieldStyles.paddingRight);
      const inputMinWidth = inputRef.current
        ? parseFloat(window.getComputedStyle(inputRef.current).minWidth) || 0
        : 0;
      const gap = chipsContainerRef.current
        ? parseFloat(window.getComputedStyle(chipsContainerRef.current).columnGap) || 0
        : 0;

      // Space the chips can occupy on the row, leaving room for the input and one gap before it.
      const availableWidth = textFieldEl.clientWidth - paddingX - inputMinWidth - gap;
      const chips = measureRefs.current.filter(Boolean) as HTMLDivElement[];
      const badgeWidth = measureBadgeRef.current?.offsetWidth ?? 0;

      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < chips.length; i++) {
        const chipWidth = (chips[i]?.offsetWidth ?? 0) + (i > 0 ? gap : 0);
        const isLastChip = i === chips.length - 1;
        const needsBadge = !isLastChip && chips.length - (count + 1) > 0;
        const requiredWidth = usedWidth + chipWidth + (needsBadge ? gap + badgeWidth : 0);

        if (requiredWidth > availableWidth && count > 0) break;

        usedWidth += chipWidth;
        count++;
      }

      setVisibleChipCount(Math.max(1, count));
    };

    measureVisible();

    const observer = new ResizeObserver(measureVisible);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [selectedOptions, isFocused, open, showSelectedCount, multiple]);

  const displayValue =
    !multiple && selectedOptions.length > 0 && selectedOptions[0]
      ? selectedOptions[0].label
      : query;

  return (
    <div className="relative w-full" ref={containerRef}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverPrimitive.Trigger asChild>
            <div>
              <TextField
                id={inputId}
                ref={inputRef}
                value={displayValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                onFocus={() => {
                  setFocusedChipIndex(-1);
                  handleFocus();
                }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={multiple && selectedOptions.length > 0 ? 'Add more...' : placeholder}
                className={cn(
                  className,
                  multiple &&
                    selectedOptions.length > 0 &&
                    'relative h-auto min-h-10 justify-start py-0.5 pr-10 pl-3 [&_input]:min-w-[104px] [&>div:last-child]:absolute [&>div:last-child]:top-1.5 [&>div:last-child]:right-1.5',
                  multiple &&
                    selectedOptions.length > 0 &&
                    showAllChips &&
                    'flex-wrap items-center gap-1 [&>div:first-child]:contents',
                )}
                disabled={disabled}
                autoComplete="off"
                startAdornment={
                  multiple &&
                  selectedOptions.length > 0 && (
                    <div
                      ref={chipsContainerRef}
                      className={cn(
                        'shrink',
                        showAllChips
                          ? 'contents'
                          : 'mr-0.5 flex flex-nowrap gap-1 overflow-hidden py-0.5',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      {(showAllChips
                        ? selectedOptions
                        : selectedOptions.slice(0, visibleChipCount)
                      ).map((option, index) => (
                        <div
                          key={option.value}
                          ref={(el) => {
                            chipRefs.current[index] = el;
                          }}
                          tabIndex={-1}
                          className={cn(
                            'focus:ring-ring rounded-lg focus:ring-3 focus:outline-none',
                            focusedChipIndex === index && 'ring-ring ring-3',
                          )}
                          onKeyDown={(e) => handleChipKeyDown(e, index)}
                          onFocus={() => {
                            setFocusedChipIndex(index);
                            handleFocus();
                          }}
                          onBlur={(e) => {
                            setFocusedChipIndex(-1);
                            handleBlur(e);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Chip
                            variant="secondary"
                            size="sm"
                            onDelete={() => handleChipRemove(option.value)}
                            className="max-w-xs"
                          >
                            <span className="truncate">{option.label}</span>
                          </Chip>
                        </div>
                      ))}
                      {!isFocused &&
                        !open &&
                        selectedOptions.length > visibleChipCount &&
                        showSelectedCount && (
                          <span className="text-muted-foreground border-border flex h-4 items-center self-center border-r px-0.5 pr-1.5 text-xs">
                            +{selectedOptions.length - visibleChipCount} more
                          </span>
                        )}
                      {/* Hidden measurement row — always renders all chips to measure real widths */}
                      {showSelectedCount && !isFocused && !open && (
                        <div
                          className="pointer-events-none invisible absolute flex gap-1"
                          aria-hidden="true"
                        >
                          {selectedOptions.map((option, index) => (
                            <div
                              key={option.value}
                              ref={(el) => {
                                measureRefs.current[index] = el;
                              }}
                            >
                              <Chip
                                variant="secondary"
                                size="sm"
                                onDelete={() => {}}
                                className="max-w-xs"
                              >
                                <span className="truncate">{option.label}</span>
                              </Chip>
                            </div>
                          ))}
                          {/* Widest possible badge ("+N more"), measured so its real width is reserved */}
                          <span
                            ref={measureBadgeRef}
                            className="text-muted-foreground border-border flex h-4 items-center self-center border-r px-0.5 pr-1.5 text-xs"
                          >
                            +{Math.max(1, selectedOptions.length - 1)} more
                          </span>
                        </div>
                      )}
                    </div>
                  )
                }
                endAdornment={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleInputClick}
                    disabled={disabled}
                    className="focus:ring-0"
                  >
                    <ChevronDownIcon
                      className={cn(
                        'size-4 transition-transform duration-200',
                        open && 'rotate-180',
                        disabled ? 'opacity-50' : 'opacity-100',
                      )}
                    />
                  </Button>
                }
              />
            </div>
          </PopoverPrimitive.Trigger>
        </div>

        <PopoverPrimitive.Portal container={popoverContainer}>
          <PopoverPrimitive.Content
            className="bg-popover text-popover-foreground shadow-bevel-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 min-w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-3xl ring-0 duration-300 ease-in-out outline-none focus:outline-none"
            align="start"
            sideOffset={8}
          >
            <div
              className="max-h-60 w-full overflow-auto p-1"
              onMouseDown={(e) => e.preventDefault()}
            >
              {filteredOptions.length === 0 ? (
                <div className="text-muted-foreground relative cursor-default px-2 py-1.5 text-sm select-none">
                  {hasTyped && query !== ''
                    ? (notFoundMessage ?? 'No options found')
                    : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        'relative flex w-full cursor-pointer items-center rounded-2xl px-2 py-1.5 text-sm outline-none select-none',
                        isFocused && 'bg-muted text-accent-foreground',
                        !isFocused && 'hover:bg-muted hover:text-accent-foreground',
                      )}
                      onClick={() => handleOptionSelect(option)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <span className="block truncate">{option.label}</span>
                      {isSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                          <CheckIcon className="size-4" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
