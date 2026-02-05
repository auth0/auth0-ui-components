import type { ActionButton } from '@auth0/universal-components-core';
import * as React from 'react';

import { Button } from './button';
import { Spinner } from './spinner';

import { cn } from '@/lib/utils';

export interface FormActionsProps<T = void> {
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
  nextAction?: Partial<ActionButton<T>>;
  previousAction?: Partial<ActionButton<T>>;
  showPrevious?: boolean;
  showNext?: boolean;
  showUnsavedChanges?: boolean;
  align?: 'left' | 'right';
  className?: string;
  unsavedChangesText?: string;
}

const DEFAULT_NEXT_ACTION: ActionButton = {
  type: 'submit',
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
  showNext = true,
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
  const isPreviousVisible = showUnsavedChanges ? showPrevious && hasUnsavedChanges : showPrevious;

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-2 p-2',
        align === 'right' ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {showUnsavedIndicator && (
        <span className="text-sm text-muted-foreground">{unsavedChangesText}</span>
      )}

      {showPrevious && (
        <Button
          type="button"
          variant={previousButtonProps.variant}
          size={previousButtonProps.size}
          onClick={handlePreviousClick}
          disabled={
            previousButtonProps.disabled || isLoading || (showUnsavedChanges && !hasUnsavedChanges)
          }
          className={cn(
            'FormActions-previous',
            showUnsavedChanges && !isPreviousVisible && 'invisible',
          )}
          aria-hidden={showUnsavedChanges && !isPreviousVisible}
          tabIndex={isPreviousVisible ? 0 : -1}
        >
          {previousButtonProps.label}
        </Button>
      )}

      {showNext && (
        <Button
          type={nextButtonProps.type}
          variant={nextButtonProps.variant}
          size={nextButtonProps.size}
          disabled={nextButtonProps.disabled || isLoading}
          className="FormActions-next min-w-17.5"
          {...(nextButtonProps.type !== 'submit' && { onClick: handleNextClick })}
        >
          {isLoading ? (
            <Spinner
              colorScheme={nextButtonProps.variant === 'destructive' ? 'primary' : 'foreground'}
              size="sm"
              aria-hidden="true"
            />
          ) : (
            <>
              {nextButtonProps.icon && (
                <span className="mr-2" aria-hidden="true">
                  {nextButtonProps.icon as React.ReactNode}
                </span>
              )}
              {nextButtonProps.label}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
