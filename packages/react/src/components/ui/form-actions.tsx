import * as React from 'react';
import { ActionButton } from '@auth0-web-ui-components/core';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/theme-utils';

export interface FormActionsProps {
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
  nextAction?: Partial<ActionButton>;
  previousAction?: Partial<ActionButton>;
  showPrevious?: boolean;
  showUnsavedChanges?: boolean;
  align?: 'left' | 'right';
  className?: string;
  unsavedChangesText?: string;
}

const DEFAULT_NEXT_ACTION: ActionButton = {
  label: 'Save',
  variant: 'primary',
  onClick: () => {},
};

const DEFAULT_PREVIOUS_ACTION: ActionButton = {
  label: 'Cancel',
  variant: 'outline',
  onClick: () => {},
};

export const FormActions: React.FC<FormActionsProps> = ({
  hasUnsavedChanges = false,
  isLoading = false,
  nextAction,
  previousAction,
  className,
  showPrevious = true,
  showUnsavedChanges = true,
  align = 'right',
  unsavedChangesText = 'Unsaved changes',
}) => {
  const nextButtonProps = React.useMemo(
    () => ({ ...DEFAULT_NEXT_ACTION, ...nextAction }),
    [nextAction],
  );

  const previousButtonProps = React.useMemo(
    () => ({ ...DEFAULT_PREVIOUS_ACTION, ...previousAction }),
    [previousAction],
  );

  const handleNextClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      nextButtonProps.onClick(e.nativeEvent);
    },
    [nextButtonProps.onClick],
  );

  const handlePreviousClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      previousButtonProps.onClick(e.nativeEvent);
    },
    [previousButtonProps.onClick],
  );

  const showUnsavedIndicator = showUnsavedChanges && hasUnsavedChanges;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-2 bg-muted/30',
        align === 'right' ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {showUnsavedIndicator && (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-orange-500 transition-colors"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">{unsavedChangesText}</span>
        </div>
      )}

      {showPrevious && (
        <Button
          type="button"
          variant={previousButtonProps.variant}
          size={previousButtonProps.size}
          onClick={handlePreviousClick}
          disabled={previousButtonProps.disabled || isLoading}
          className={previousButtonProps.className}
        >
          {previousButtonProps.label}
        </Button>
      )}

      <Button
        type="submit"
        variant={nextButtonProps.variant}
        size={nextButtonProps.size}
        disabled={nextButtonProps.disabled || isLoading}
        className={nextButtonProps.className}
        onClick={handleNextClick}
      >
        {isLoading ? <Spinner size="sm" aria-hidden="true" /> : nextButtonProps.label}
      </Button>
    </div>
  );
};
