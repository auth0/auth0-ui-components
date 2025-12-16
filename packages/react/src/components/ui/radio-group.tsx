import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as React from 'react';

import { cn } from '../../lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.RadioGroup
      data-slot="radio-group"
      className={cn('space-y-2', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'shadow-checkbox-resting peer border-border hover:shadow-checkbox-hover data-[state=checked]:hover:border-primary data-[state=checked]:border-primary hover:border-accent focus-visible:ring-ring data-[disabled]:border-border/50 data-[disabled]:bg-muted/50 data-[disabled]:data-[state=checked]:border-border/50 size-5 appearance-none rounded-full border transition-all duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed data-[state=checked]:border-7',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="fill-primary-foreground top-1/2 left-1/2 hidden size-2 -translate-x-1/2 -translate-y-1/2 data-[checked]:absolute"
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
