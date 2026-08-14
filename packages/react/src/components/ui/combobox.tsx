import * as PopoverPrimitive from '@radix-ui/react-popover';
import { BanIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { cn } from '@/lib/utils';
import { useId } from '@/lib/utils/use-id-compat';
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
  filterLocally?: boolean;
  retainQueryOnSelect?: boolean;
  debounceMs?: number;
  loading?: boolean;
  loadingMessage?: string;
  maxSelections?: number;
  maxSelectionsMessage?: string;
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
  filterLocally = true,
  retainQueryOnSelect = false,
  debounceMs = 300,
  loading = false,
  loadingMessage,
  maxSelections,
  maxSelectionsMessage,
}: ComboboxProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [hasTyped, setHasTyped] = React.useState(false);
  const [focusedChipIndex, setFocusedChipIndex] = React.useState(-1);
  const [visibleChipCount, setVisibleChipCount] = React.useState(1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chipRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const measureRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const measureBadgeRef = React.useRef<HTMLSpanElement>(null);
  const chipsContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pointerFocusRef = React.useRef(false);

  const portalContainer = usePortalContainer();
  const reactId = useId();
  const inputId = `combobox-input-${reactId}`;

  const onInputChangeRef = React.useRef(onInputChange);
  onInputChangeRef.current = onInputChange;

  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isDebouncePending, setIsDebouncePending] = React.useState(false);

  const cancelPendingEmit = React.useCallback(() => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = undefined;
    setIsDebouncePending(false);
  }, []);

  const emitInputChange = React.useCallback(
    (next: string) => {
      cancelPendingEmit();
      if (filterLocally || debounceMs <= 0) {
        onInputChangeRef.current?.(next);
        return;
      }
      setIsDebouncePending(true);
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = undefined;
        setIsDebouncePending(false);
        onInputChangeRef.current?.(next);
      }, debounceMs);
    },
    [filterLocally, debounceMs, cancelPendingEmit],
  );

  React.useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  const isLoading = loading || isDebouncePending;

  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const dialogContent = containerRef.current?.closest<HTMLElement>(
      '[data-slot="dialog-content"]',
    );
    setPopoverContainer(dialogContent ?? portalContainer);
  }, [open, portalContainer]);

  const selectedValues = React.useMemo<string[]>(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return typeof value === 'string' ? [value] : [];
  }, [value, multiple]);

  const isSelectionLimitReached =
    multiple && maxSelections !== undefined && selectedValues.length >= maxSelections;

  const isOptionDisabled = React.useCallback(
    (option: ComboboxOption) => isSelectionLimitReached && !selectedValues.includes(option.value),
    [isSelectionLimitReached, selectedValues],
  );

  // Cache of currently selected options, keyed by value. Lets chips keep their
  // label even after `options` narrows to a server-filtered subset that no longer
  // contains them. Bounded to selectedValues so it can't grow across searches.
  const selectedOptionsCacheRef = React.useRef(new Map<string, ComboboxOption>());

  const selectedOptions = React.useMemo(() => {
    // Maintain the cache inside the memo, keyed on both `selectedValues` and `options`,
    // so an in-place label change (same value, new label) re-derives instead of going
    // stale, and the O(N) prune/refresh runs only when selection or options change —
    // not on every unrelated re-render (hover, resize, chip focus).
    const cache = selectedOptionsCacheRef.current;
    for (const key of cache.keys()) {
      if (!selectedValues.includes(key)) cache.delete(key);
    }
    for (const option of options) {
      if (selectedValues.includes(option.value)) cache.set(option.value, option);
    }
    return selectedValues
      .map((val) => cache.get(val))
      .filter((opt): opt is ComboboxOption => opt !== undefined);
  }, [selectedValues, options]);

  const filteredOptions = React.useMemo(() => {
    if (!filterLocally || !hasTyped || query === '') return options;
    return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query, hasTyped, filterLocally]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newQuery = event.target.value;
    setQuery(newQuery);
    setOpen(true);
    setHasTyped(true);
    setFocusedIndex(-1);
    emitInputChange(newQuery);

    if (!multiple && selectedOptions.length > 0 && newQuery !== selectedOptions[0]?.label) {
      onChange?.(newQuery);
    }
  };

  const handleOptionSelect = (option: ComboboxOption) => {
    if (disabled) return;
    if (isOptionDisabled(option)) return;

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

  const handleBlur = (event: React.FocusEvent) => {
    if (containerRef.current && containerRef.current.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    setFocusedChipIndex(-1);
  };

  const findNextEnabledIndex = React.useCallback(
    (from: number, step: 1 | -1) => {
      const n = filteredOptions.length;
      if (n === 0) return -1;
      for (let i = 1; i <= n; i++) {
        const candidate = (((from + step * i) % n) + n) % n;
        const option = filteredOptions[candidate];
        if (option && !isOptionDisabled(option)) return candidate;
      }
      return -1;
    },
    [filteredOptions, isOptionDisabled],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setHasTyped(false);
        } else if (!isLoading) {
          setFocusedIndex((prev) => findNextEnabledIndex(prev, 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (open && !isLoading) {
          setFocusedIndex((prev) => findNextEnabledIndex(prev, -1));
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
          if (focusedChipIndex === -1) break;
          if (focusedChipIndex < selectedOptions.length - 1) {
            const nextIndex = focusedChipIndex + 1;
            setFocusedChipIndex(nextIndex);
            chipRefs.current[nextIndex]?.focus();
          } else {
            setFocusedChipIndex(-1);
            inputRef.current?.focus();
          }
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const focusedOption = filteredOptions[focusedIndex];
        if (open && !isLoading && focusedIndex >= 0 && focusedOption) {
          handleOptionSelect(focusedOption);
        }
        break;
      }
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
      cancelPendingEmit();
      setQuery(selectedOptions[0].label);
    } else if (multiple || selectedOptions.length === 0) {
      if (retainQueryOnSelect && multiple && selectedValues.length > 0) return;
      if (query !== '') {
        setQuery('');
        cancelPendingEmit();
        onInputChangeRef.current?.('');
      }
    }
  }, [selectedValues, multiple, retainQueryOnSelect]);

  React.useEffect(() => {
    if (open || !retainQueryOnSelect || !multiple) return;
    if (query !== '') {
      setQuery('');
      setHasTyped(false);
      cancelPendingEmit();
      onInputChangeRef.current?.('');
    }
  }, [open, retainQueryOnSelect, multiple]);

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
    <div className="relative w-full" ref={containerRef} onBlur={handleBlur}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverPrimitive.Trigger asChild>
            <div>
              <TextField
                id={inputId}
                ref={inputRef}
                value={displayValue}
                onChange={handleInputChange}
                onPointerDown={() => {
                  pointerFocusRef.current = true;
                }}
                onClick={handleInputClick}
                onFocus={(e) => {
                  setIsFocused(true);
                  setFocusedChipIndex(-1);
                  const cameFromWidget = containerRef.current?.contains(e.relatedTarget as Node);
                  if (cameFromWidget && !pointerFocusRef.current) {
                    setHasTyped(false);
                    setOpen(true);
                  }
                  pointerFocusRef.current = false;
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
                            setIsFocused(true);
                            setFocusedChipIndex(index);
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
                      {!showAllChips && selectedOptions.length > visibleChipCount && (
                        <span className="text-muted-foreground border-border flex h-4 items-center self-center border-r px-0.5 pr-1.5 text-xs">
                          +{selectedOptions.length - visibleChipCount} more
                        </span>
                      )}
                      {/* Hidden measurement row — always renders all chips to measure real widths */}
                      {showSelectedCount && !showAllChips && (
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
                    {isLoading ? (
                      <Spinner
                        size="sm"
                        colorScheme="muted"
                        className={cn(disabled ? 'opacity-50' : 'opacity-100')}
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDownIcon
                        className={cn(
                          'size-4 transition-transform duration-200',
                          open && 'rotate-180',
                          disabled ? 'opacity-50' : 'opacity-100',
                        )}
                      />
                    )}
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
              {isLoading ? (
                <div className="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-sm select-none">
                  <Spinner size="sm" colorScheme="muted" aria-hidden="true" />
                  {loadingMessage ?? 'Searching...'}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="text-muted-foreground relative cursor-default px-2 py-1.5 text-sm select-none">
                  {hasTyped && query !== ''
                    ? (notFoundMessage ?? 'No options found')
                    : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;
                  const isDisabled = isOptionDisabled(option);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                      className={cn(
                        'relative flex w-full items-center rounded-2xl px-2 py-1.5 text-sm outline-none select-none',
                        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                        isFocused && 'bg-muted text-accent-foreground',
                        !isFocused && !isDisabled && 'hover:bg-muted hover:text-accent-foreground',
                      )}
                      onClick={() => handleOptionSelect(option)}
                      onMouseEnter={() => {
                        if (!isDisabled) setFocusedIndex(index);
                      }}
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
      {isSelectionLimitReached && (
        <p role="status" className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
          <BanIcon className="size-3.5 shrink-0" aria-hidden="true" />
          {maxSelectionsMessage ?? `Only ${maxSelections} can be selected at a time`}
        </p>
      )}
    </div>
  );
}
