import { useTranslator } from '../../../../../../hooks/use-translator';
import { cn } from '../../../../../../lib/theme-utils';
import type { ProvisioningDeleteTokenModalContentProps } from '../../../../../../types/my-organization/idp-management/sso-provisioning/provisioning-token-types';

export function ProvisioningDeleteTokenModalContent({
  customMessages = {},
  className,
  tokenId,
}: ProvisioningDeleteTokenModalContentProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.manage_tokens.delete_modal.content',
    customMessages,
  );

  return (
    <div className={cn('space-y-4', className)}>
      <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph)')}>
        {t('confirmation', { tokenId })}
      </p>
      <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph)')}>
        {t('description')}
      </p>
    </div>
  );
}
