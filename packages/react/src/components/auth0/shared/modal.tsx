import * as React from 'react';

import { FormActions, type FormActionsProps } from '@/components/auth0/shared/form-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  content?: React.ReactNode;
  modalActions?: FormActionsProps;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  content,
  modalActions,
  className,
  showCloseButton,
}) => {
  const hasHeader = title || description;

  const actions: FormActionsProps = {
    hasUnsavedChanges: true,
    showPrevious: true,
    showUnsavedChanges: false,
    previousAction: {
      label: 'Cancel',
      variant: 'outline',
      onClick: () => onOpenChange(false),
    },
    nextAction: {
      label: 'Confirm',
      variant: 'primary',
      onClick: () => onOpenChange(false),
    },
    ...modalActions,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className} showCloseButton={showCloseButton}>
        {hasHeader && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {content && <div className="py-4">{content}</div>}

        <DialogFooter>
          <FormActions {...actions} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

Modal.displayName = 'Modal';
