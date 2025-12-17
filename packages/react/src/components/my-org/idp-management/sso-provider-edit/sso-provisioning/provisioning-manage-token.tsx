'use client';

import {
  getComponentStyles,
  type IdpScimTokenBase,
  type CreateIdpProvisioningScimTokenResponseContent,
} from '@auth0/universal-components-core';
import { Trash2, Plus } from 'lucide-react';
import * as React from 'react';

import { useTheme } from '../../../../../hooks/use-theme';
import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { ProvisioningManageTokenProps } from '../../../../../types/my-org/idp-management/sso-provisioning/provisioning-manage-token-types';
import { Badge } from '../../../../ui/badge';
import { Button } from '../../../../ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../ui/card';
import { Spinner } from '../../../../ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../../ui/tooltip';

import { ProvisioningCreateTokenModal } from './sso-provisioning-create-token/provisioning-create-token-modal';
import { ProvisioningDeleteTokenModal } from './sso-provisioning-delete-token/provisioning-delete-token-modal';

const MAX_TOKENS = 2;
const TOKEN_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
} as const;

export function ProvisioningManageToken({
  isScimTokensLoading,
  isScimTokenCreating,
  isScimTokenDeleting,
  onListScimTokens,
  onCreateScimToken,
  onDeleteScimToken,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: ProvisioningManageTokenProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.manage_tokens',
    customMessages,
  );
  const { isDarkMode } = useTheme();
  const [deleteTokenId, setDeleteTokenId] = React.useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [scimTokens, setScimTokens] = React.useState<IdpScimTokenBase[]>([]);
  const [createdToken, setCreatedToken] =
    React.useState<CreateIdpProvisioningScimTokenResponseContent | null>(null);

  React.useEffect(() => {
    const loadTokens = async () => {
      const tokens = await onListScimTokens();
      if (tokens?.scim_tokens) {
        setScimTokens(tokens.scim_tokens);
      }
    };
    loadTokens();
  }, []);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const canGenerateToken = scimTokens.length < MAX_TOKENS;

  const getTokenStatus = (
    token: IdpScimTokenBase,
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

  const handleGenerateToken = async () => {
    const result = await onCreateScimToken({ token_lifetime: 3600 });
    if (result) {
      setCreatedToken(result);
      setIsCreateModalOpen(true);
      const tokens = await onListScimTokens();
      if (tokens?.scim_tokens) {
        setScimTokens(tokens.scim_tokens);
      }
    }
  };

  const handleDeleteClick = (tokenId: string) => {
    setDeleteTokenId(tokenId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTokenId) {
      await onDeleteScimToken(deleteTokenId);
      setDeleteTokenId(null);
      const tokens = await onListScimTokens();
      if (tokens?.scim_tokens) {
        setScimTokens(tokens.scim_tokens);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setCreatedToken(null);
    setIsCreateModalOpen(false);
  };

  return (
    <div
      className={cn('w-full', currentStyles.classes?.['ProvisioningManageToken-root'])}
      style={currentStyles?.variables}
    >
      <Card className={cn(currentStyles.classes?.['ProvisioningManageToken-card'])}>
        <CardHeader className={cn(currentStyles.classes?.['ProvisioningManageToken-header'])}>
          <CardTitle className="text-base font-medium text-foreground text-left">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-left">
            {t('description')}
          </CardDescription>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    onClick={handleGenerateToken}
                    disabled={!canGenerateToken || isScimTokenCreating}
                    title={undefined}
                  >
                    {isScimTokenCreating ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    )}
                    {t('generate_button_label')}
                  </Button>
                </span>
              </TooltipTrigger>
              {!canGenerateToken && <TooltipContent>{t('max_tokens_tooltip')}</TooltipContent>}
            </Tooltip>
          </CardAction>
        </CardHeader>

        {isScimTokensLoading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : scimTokens.length > 0 ? (
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
                      type="button"
                      onClick={() => handleDeleteClick(token.token_id)}
                      disabled={isScimTokenDeleting}
                      aria-label={`${t('token_item.delete_button_label')} ${token.token_id}`}
                      className="shrink-0"
                    >
                      {isScimTokenDeleting ? (
                        <Spinner className="w-4 h-4 mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      )}
                      {t('token_item.delete_button_label')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        ) : null}
      </Card>

      <ProvisioningCreateTokenModal
        open={isCreateModalOpen}
        isLoading={isScimTokenCreating}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            handleCloseCreateModal();
          }
        }}
        createdToken={createdToken}
        customMessages={customMessages}
        styling={styling}
      />

      <ProvisioningDeleteTokenModal
        open={!!deleteTokenId}
        isLoading={isScimTokenDeleting}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeleteTokenId(null);
          }
        }}
        tokenId={deleteTokenId}
        onConfirm={handleDeleteConfirm}
        customMessages={customMessages}
        styling={styling}
      />
    </div>
  );
}
