import * as React from 'react';
import { ActionButton } from '@auth0-web-ui-components/core';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/theme-utils';

export interface FormActionsProps {
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
  saveAction?: Partial<ActionButton>;
  cancelAction?: Partial<ActionButton>;
  showCancel?: boolean;
  showUnsavedChanges?: boolean;
  align?: 'left' | 'right';
  className?: string;
  unsavedChangesText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  hasUnsavedChanges = false,
  isLoading = false,
  saveAction,
  cancelAction,
  className,
  showCancel = true,
  showUnsavedChanges = true,
  align = 'right',
  unsavedChangesText = 'Unsaved changes',
}) => {
  const defaultSaveAction: ActionButton = {
    label: 'Save',
    variant: 'primary',
    onClick: () => {},
    ...saveAction,
  };

  const defaultCancelAction: ActionButton = {
    label: 'Cancel',
    variant: 'outline',
    onClick: () => {},
    ...cancelAction,
  };

  const handleClick = (action: ActionButton) => (e: React.MouseEvent<HTMLButtonElement>) => {
    action.onClick(e.nativeEvent);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-2 bg-muted/30',
        align === 'right' ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {showUnsavedChanges && hasUnsavedChanges && (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-orange-500 transition-colors"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">{unsavedChangesText}</span>
        </div>
      )}

      {showCancel && hasUnsavedChanges && (
        <Button
          type="button"
          variant={defaultCancelAction.variant}
          size={defaultCancelAction.size}
          onClick={handleClick(defaultCancelAction)}
          disabled={defaultCancelAction.disabled || isLoading}
        >
          {defaultCancelAction.label}
        </Button>
      )}

      <Button
        type="submit"
        variant={defaultSaveAction.variant}
        size={defaultSaveAction.size}
        disabled={defaultSaveAction.disabled || isLoading}
        onClick={handleClick(defaultSaveAction)}
      >
        {isLoading ? <Spinner size="sm" aria-hidden="true" /> : defaultSaveAction.label}
      </Button>
    </div>
  );
};
