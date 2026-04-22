import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'theme-default:shadow-xs box-border inline-flex items-center gap-1 overflow-clip rounded-2xl border border-transparent font-medium',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground theme-default:border-primary hover:bg-primary/90',
        secondary:
          'theme-default:bg-muted bg-accent/10 text-muted-foreground hover:bg-accent/20 theme-default:border-muted-foreground/25 theme-default:hover:bg-muted/90',
        outline: 'border-border hover:bg-muted',
        info: 'bg-info text-info-foreground theme-default:border-info-foreground/25 hover:bg-info/90',
        success:
          'bg-success theme-default:border-success-foreground/25 text-success-foreground hover:bg-success/90',
        warning:
          'bg-warning theme-default:border-warning-foreground/25 text-warning-foreground hover:bg-warning/90',
        destructive:
          'bg-destructive theme-default:border-destructive-foreground/25 text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'rounded-lg py-0.5 pr-0.5 pl-1.5 text-xs',
        md: 'rounded-xl py-1 pr-1 pl-2 text-sm',
        lg: 'rounded-2xl py-1.5 pr-1.5 pl-2.5 text-sm',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
    },
  },
);

const iconSizeVariants = cva('', {
  variants: {
    size: {
      sm: 'h-5 w-5 rounded-md',
      md: 'h-6 w-6 rounded-lg',
      lg: 'h-7 w-7 rounded-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  onDelete?: () => void;
  icon?: React.ReactNode;
}

function Chip({
  children,
  variant,
  size,
  disabled,
  onDelete,
  icon,
  className,
  ...props
}: ChipProps) {
  const handleChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.();
  };

  return (
    <div
      className={cn(chipVariants({ variant, size, disabled }), className)}
      {...props}
      data-slot="chip"
      onClick={handleChipClick}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="pointer-events-none">{children}</span>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteClick}
          className={cn(
            chipVariants({ variant, disabled }),
            iconSizeVariants({ size }),
            'theme-default:shadow-none border-none p-1',
          )}
          disabled={!!disabled}
        >
          <X className={iconSizeVariants({ size })} />
        </Button>
      )}
    </div>
  );
}

export { Chip };
