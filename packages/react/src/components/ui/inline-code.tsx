import * as React from 'react';

import { cn } from '@/lib/theme-utils';

export interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        'bg-background theme-default:shadow-input-resting theme-default:bg-secondary shadow-bevel-xs relative rounded-lg px-[0.35rem] py-[0.2rem] font-mono text-sm font-medium tracking-tight',
        className,
      )}
    >
      {children}
    </code>
  );
}
