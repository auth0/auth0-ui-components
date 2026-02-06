import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group shadow-checkbox-resting peer hover:shadow-checkbox-hover focus-visible:ring-ring hover:border-primary/50 border-border data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative flex size-6 shrink-0 appearance-none items-center justify-center rounded-lg border transition-[colors,shadow] duration-150 ease-in-out outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group-data-[state=checked]:animate-in group-data-[state=unchecked]:animate-out group-data-[state=unchecked]:fade-out-0 group-data-[state=checked]:fade-in-0 group-data-[state=unchecked]:slide-out-to-bottom-5 group-data-[state=unchecked]:zoom-out-75 group-data-[state=checked]:zoom-in-75 group-data-[state=checked]:slide-in-from-bottom-5 text-primary-foreground stroke-primary-foreground duration-150 ease-in-out group-data-[state=checked]:block"
      >
        {props.checked === 'indeterminate' ? (
          <MinusIcon className="size-3 stroke-[4px]" absoluteStrokeWidth />
        ) : (
          <CheckIcon className="size-3 stroke-[4px]" absoluteStrokeWidth />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
