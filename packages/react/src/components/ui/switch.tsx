'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'theme-default:shadow-switch-resting data-[state=checked]:from-primary-foreground/0 data-[state=checked]:to-primary-foreground/25 from-primary-foreground/50 to-primary-foreground/0 bg-accent/50 hover:bg-accent/75 data-[state=checked]:hover:bg-primary theme-default:hover:shadow-switch-hover data-[state=checked]:bg-primary focus-visible:ring-ring focus-within:ring-ring relative h-7 w-[46px] rounded-full bg-gradient-to-l transition-all duration-150 ease-in-out focus-visible:ring-4 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'dark:bg-primary dark:shadow-switch-thumb-dark data-[state=checked]:dark:bg-background bg-background to-background/0 from-primary/5 shadow-switch-thumb data-[state=checked]:bg-background pointer-events-none absolute top-[4px] left-[4px] h-5 w-5 rounded-full bg-gradient-to-t transition-transform duration-150 ease-in-out data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
