/**
 * SSO domain assign modal.
 * @module sso-domain-assign-modal
 * @internal
 */

import * as React from 'react';

import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';
import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { CONFIGURE_ORG_DOMAINS_DOCS_URL } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import { cn } from '@/lib/utils';
import type { SsoDomainAssignModalProps } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

const DOMAIN_FIELD_ID = 'sso-domain-assign-domains';

/**
 * Modal for assigning verified domains that no identity provider holds to the identity provider.
 * @param props - Component props.
 * @param props.translatorKey - Translation namespace key
 * @param props.className - Optional CSS class name for styling
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.isOpen - Whether the modal/dialog is open
 * @param props.isLoading - Whether the list of available domains is loading
 * @param props.isAssigning - Whether domains are being assigned
 * @param props.domains - Domains available to assign
 * @param props.onClose - Callback fired when the component should close
 * @param props.onAssign - Callback fired with the selected domains; resolves true when all were assigned
 * @returns JSX element
 */
export function SsoDomainAssignModal({
  translatorKey = 'idp_management.edit_sso_provider.tabs.domains.content.domain_assign.modal',
  className,
  customMessages,
  isOpen,
  isLoading,
  isAssigning,
  domains,
  onClose,
  onAssign,
}: SsoDomainAssignModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const [selectedNames, setSelectedNames] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!isOpen) setSelectedNames([]);
  }, [isOpen]);

  const options: ComboboxOption[] = React.useMemo(
    () => domains.map(({ domain }) => ({ value: domain, label: domain })),
    [domains],
  );

  const selection = React.useMemo(
    () => selectedNames.filter((name) => options.some((option) => option.value === name)),
    [selectedNames, options],
  );

  const handleAssign = async () => {
    const selectedDomains = domains.filter(({ domain }) => selection.includes(domain));
    if (selectedDomains.length === 0) return;
    const assignedAll = await onAssign(selectedDomains);
    if (assignedAll) onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className={cn('p-10', className)}
      title={t('title')}
      content={
        <div className="space-y-6">
          <p className="text-muted-foreground text-paragraph">{t('description')}</p>
          <div className="space-y-2">
            <Label htmlFor={DOMAIN_FIELD_ID} className="text-label font-medium">
              {t('field.label')}
            </Label>
            <Combobox
              id={DOMAIN_FIELD_ID}
              multiple
              value={selection}
              onChange={(value) => setSelectedNames(value as string[])}
              options={options}
              placeholder={t('field.placeholder')}
              noOptionsMessage={t('field.empty_message')}
              loading={isLoading}
              disabled={isAssigning}
            />
            <p className="text-muted-foreground text-paragraph">{t('field.helper_text')}</p>
          </div>
          <p className="text-muted-foreground text-paragraph">
            {t('learn_more.text')}{' '}
            <Link href={CONFIGURE_ORG_DOMAINS_DOCS_URL} target="_blank" rel="noopener noreferrer">
              {t('learn_more.link_text')}
            </Link>
          </p>
        </div>
      }
      modalActions={{
        isLoading: isAssigning,
        showNext: true,
        previousAction: {
          label: t('actions.cancel_button_text'),
          onClick: onClose,
        },
        nextAction: {
          type: 'button',
          label: t('actions.assign_button_text'),
          disabled: selection.length === 0 || isAssigning,
          onClick: handleAssign,
        },
      }}
    />
  );
}
