import { MessageSquare } from 'lucide-react';
import React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { DomainVerifyModalProps } from '../../../../types/my-organization/domain-management/domain-verify-types';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { CopyableTextField } from '../../../ui/copyable-text-field';
import { Label } from '../../../ui/label';
import { Modal } from '../../../ui/modal';
import { Spinner } from '../../../ui/spinner';

export function DomainVerifyModal({
  translatorKey = 'domain_management.domain_verify.modal',
  className,
  customMessages,
  isOpen,
  isLoading,
  domain,
  error,
  onClose,
  onVerify,
  onDelete,
}: DomainVerifyModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const handleVerify = React.useCallback(() => {
    if (domain) {
      onVerify(domain);
    }
  }, [onVerify, domain]);

  const handleDelete = React.useCallback(() => {
    if (domain) {
      onDelete(domain);
    }
  }, [onDelete, domain]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="p-10"
      title={t('title', { domainName: domain?.domain })}
      content={
        <div className={cn('space-y-4', className)}>
          {error && (
            <Alert variant="destructive">
              <MessageSquare className="h-4 w-4" />
              <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="txt-record-name" className="text-sm font-medium">
              {t('txt_record_name.label')}
            </Label>
            <CopyableTextField
              id="txt-record-name"
              value={domain?.verification_host || ''}
              readOnly
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="txt-record-content" className="text-sm font-medium">
              {t('txt_record_content.label')}
            </Label>
            <CopyableTextField
              id="txt-record-content"
              value={domain?.verification_txt || ''}
              readOnly
              className="text-sm"
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground font-medium">
                {t('verification_status.label')}
              </span>
              <Badge variant="warning">{t('verification_status.pending')}</Badge>
            </div>
            <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph')}>
              {t('verification_status.description')}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleVerify} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : t('actions.verify_button_text')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {t('actions.delete_button_text')}
            </Button>
          </div>
        </div>
      }
      modalActions={{
        showNext: false,
        previousAction: {
          label: t('actions.done_button_text'),
          onClick: onClose,
          variant: 'primary',
        },
      }}
    />
  );
}
