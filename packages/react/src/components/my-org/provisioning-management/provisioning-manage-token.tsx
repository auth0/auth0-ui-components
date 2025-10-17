import { getComponentStyles } from '@auth0-web-ui-components/core';
import { Trash2, Plus } from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { withMyOrgService } from '../../../hoc';
import { useTheme, useTranslator } from '../../../hooks';
import { cn } from '../../../lib/theme-utils';
import type { ProvisioningManageTokenProps } from '../../../types';

import { ProvisioningCreateTokenModal } from './provisioning-create-token-modal';
import { ProvisioningDeleteTokenModal } from './provisioning-delete-token-modal';

const MAX_TOKENS = 2;
const TOKEN_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
} as const;

function ProvisioningManageTokenComponent({
  scimTokens,
  onGenerateToken,
  onDeleteToken,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
  className,
  createdToken = null,
  onCloseCreateModal,
}: ProvisioningManageTokenProps): React.JSX.Element {
  const { t } = useTranslator('provisioning_management.manage_tokens', customMessages);
  const { isDarkMode } = useTheme();
  const [deleteTokenId, setDeleteTokenId] = React.useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Sync modal state with createdToken prop
  React.useEffect(() => {
    setIsCreateModalOpen(!!createdToken);
  }, [createdToken]);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const canGenerateToken = scimTokens.length < MAX_TOKENS;

  const getTokenStatus = (
    token: (typeof scimTokens)[0],
  ): {
    labelKey: string;
    variant: 'secondary' | 'destructive';
  } => {
    if (!token.valid_until) {
      return { labelKey: TOKEN_STATUS.ACTIVE, variant: 'secondary' };
    }

    const expiryDate = new Date(token.valid_until);
    const now = new Date();
    const isExpired = expiryDate < now;

    return {
      labelKey: isExpired ? TOKEN_STATUS.EXPIRED : TOKEN_STATUS.ACTIVE,
      variant: isExpired ? 'destructive' : 'secondary',
    };
  };

  const handleDeleteClick = (tokenId: string) => {
    setDeleteTokenId(tokenId);
  };

  const handleDeleteConfirm = () => {
    if (deleteTokenId) {
      onDeleteToken(deleteTokenId);
      setDeleteTokenId(null);
    }
  };

  return (
    <div
      className={cn('w-full', className, currentStyles.classes?.['ProvisioningManageToken-root'])}
      style={currentStyles?.variables}
    >
      <Card className={cn(currentStyles.classes?.['ProvisioningManageToken-card'])}>
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground text-left">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-left">
            {t('description')}
          </CardDescription>
          <CardAction>
            <Button
              onClick={onGenerateToken}
              disabled={!canGenerateToken}
              title={!canGenerateToken ? t('max_tokens_tooltip') : undefined}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('generate_button_label')}
            </Button>
          </CardAction>
        </CardHeader>
        {scimTokens.length > 0 && (
          <CardContent className="space-y-4">
            {scimTokens.map((token) => {
              const status = getTokenStatus(token);
              const showExpiry = !token.valid_until;

              return (
                <div key={token.token_id} className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {t('token_item.token_prefix')} {token.token_id}
                    </p>
                    {showExpiry && (
                      <p className="text-sm text-muted-foreground">
                        {t('token_item.never_expire')}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('token_item.last_used')}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Badge variant={status.variant} className="shrink-0">
                      {t(`token_item.status_${status.labelKey}`)}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="default"
                      onClick={() => handleDeleteClick(token.token_id)}
                      aria-label={`${t('token_item.delete_button_label')} ${token.token_id}`}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      {t('token_item.delete_button_label')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      <ProvisioningCreateTokenModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open && onCloseCreateModal) {
            onCloseCreateModal();
          }
        }}
        createdToken={createdToken}
        customMessages={customMessages}
      />

      <ProvisioningDeleteTokenModal
        open={!!deleteTokenId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTokenId(null);
          }
        }}
        tokenId={deleteTokenId}
        onConfirm={handleDeleteConfirm}
        customMessages={customMessages}
      />
    </div>
  );
}

export const ProvisioningManageToken = withMyOrgService(ProvisioningManageTokenComponent);
