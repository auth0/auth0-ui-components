/** @module user-passkey-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import { MoreVertical, Trash2, UserRoundKey } from 'lucide-react';
import * as React from 'react';

import { PasskeyActionModal } from '@/components/auth0/my-account/shared/passkey/passkey-action-modal';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useUserPasskey } from '@/hooks/my-account/use-user-passkey';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  UserPasskeyMgmtViewProps,
  UserPasskeyMgmtProps,
} from '@/types/my-account/passkey/passkey-types';

/**
 * Passkey management component.
 * @param props - Component props
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.hideHeader - Whether to hide the header
 * @param props.addAction - Configuration for the add passkey action
 * @param props.revokeAction - Configuration for the revoke passkey action
 * @param props.onFetch - Callback after passkeys are loaded
 * @param props.onErrorAction - Callback when an action errors
 * @returns JSX element
 * @internal
 */
function UserPasskeyMgmt(props: UserPasskeyMgmtProps) {
  const {
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    hideHeader = false,
    addAction,
    revokeAction,
    onFetch,
    onErrorAction,
  } = props;

  const {
    passkeys,
    isLoading,
    isEnrolling,
    isRevoking,
    disableAdd,
    disableRevoke,
    isRevokeModalOpen,
    currentPasskey,
    setIsRevokeModalOpen,
    handleAddPasskey,
    handleRevokePasskey,
    handleConfirmRevoke,
  } = useUserPasskey({
    customMessages,
    addAction,
    revokeAction,
    onFetch,
    onErrorAction,
  });

  return (
    <GateKeeper isLoading={isLoading} styling={styling}>
      <UserPasskeyMgmtView
        passkeys={passkeys}
        isEnrolling={isEnrolling}
        isRevoking={isRevoking}
        styling={styling}
        customMessages={customMessages}
        hideHeader={hideHeader}
        disableAdd={disableAdd}
        disableRevoke={disableRevoke}
        isRevokeModalOpen={isRevokeModalOpen}
        currentPasskey={currentPasskey}
        handleAddPasskey={handleAddPasskey}
        handleRevokePasskey={handleRevokePasskey}
        handleConfirmRevoke={handleConfirmRevoke}
        setIsRevokeModalOpen={setIsRevokeModalOpen}
      />
    </GateKeeper>
  );
}

/**
 * UserPasskeyMgmtView — presentational component.
 * @internal
 * @param props - {@link UserPasskeyMgmtViewProps}
 * @returns View component
 */
function UserPasskeyMgmtView(props: UserPasskeyMgmtViewProps) {
  const {
    passkeys,
    isEnrolling,
    isRevoking,
    styling,
    customMessages,
    hideHeader,
    disableAdd,
    disableRevoke,
    isRevokeModalOpen,
    currentPasskey,
    handleAddPasskey,
    handleRevokePasskey,
    handleConfirmRevoke,
    setIsRevokeModalOpen,
  } = props;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('passkey', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const hasPasskeys = passkeys.length > 0;

  return (
    <StyledScope style={currentStyles.variables}>
      {!hideHeader && <Header title={t('header.title')} description={t('header.description')} />}

      <Card className={cn(currentStyles.classes?.['UserPasskeyMgmt-root'])}>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-base text-(length:--font-size-body) font-semibold text-card-foreground">
              {t('section_title')}
            </span>
            {hasPasskeys && (
              <Badge variant="success" size="sm" className="shrink-0" aria-label={t('enabled')}>
                {t('enabled')}
              </Badge>
            )}
          </CardTitle>
          {!hasPasskeys && <CardDescription>{t('no_passkeys')}</CardDescription>}
          {!disableAdd && (
            <CardAction>
              <Button
                size="default"
                variant="outline"
                className="text-sm w-full sm:w-auto shrink-0"
                onClick={handleAddPasskey}
                disabled={isEnrolling}
                aria-busy={isEnrolling}
                aria-label={t('add_passkey')}
              >
                {isEnrolling ? (
                  <Spinner size="sm" colorScheme="primary" aria-hidden="true" />
                ) : (
                  t('add_passkey')
                )}
              </Button>
            </CardAction>
          )}
        </CardHeader>

        {hasPasskeys && (
          <CardContent className="space-y-2">
            {passkeys.map((passkey) => (
              <Card
                key={passkey.id}
                className={cn(currentStyles.classes?.['UserPasskeyMgmt-item'])}
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <UserRoundKey
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <CardTitle className="text-base text-(length:--font-size-body) font-semibold text-card-foreground">
                      {passkey.name}
                    </CardTitle>
                    {(passkey.deviceInfo || passkey.createdAt || passkey.lastUsedAt) && (
                      <CardDescription className="flex flex-wrap items-center gap-x-1.5">
                        {passkey.deviceInfo && <span>{passkey.deviceInfo}</span>}
                        {passkey.createdAt && (
                          <>
                            {passkey.deviceInfo && <span aria-hidden="true">•</span>}
                            <span>
                              {t('created_at', {
                                date: new Date(passkey.createdAt).toLocaleDateString(),
                              })}
                            </span>
                          </>
                        )}
                        {passkey.lastUsedAt && (
                          <>
                            {(passkey.deviceInfo || passkey.createdAt) && (
                              <span aria-hidden="true">•</span>
                            )}
                            <span>
                              {t('last_used', {
                                date: new Date(passkey.lastUsedAt).toLocaleDateString(),
                              })}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    )}
                  </div>
                  {!disableRevoke && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={passkey.name}
                        className="h-8 w-8 p-0 rounded-xl bg-primary border border-primary/20 shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
                      >
                        <MoreVertical className="h-4 w-4 text-primary-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRevokePasskey(passkey)}
                            className="text-destructive-foreground focus:text-destructive-foreground"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('actions.revoke')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenuPortal>
                    </DropdownMenu>
                  )}
                </CardHeader>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>

      <PasskeyActionModal
        open={isRevokeModalOpen}
        onOpenChange={setIsRevokeModalOpen}
        isPending={isRevoking}
        onConfirm={handleConfirmRevoke}
        name={currentPasskey?.name}
        styling={styling}
        customMessages={customMessages?.modals?.revoke}
      />
    </StyledScope>
  );
}

/**
 * Passkey management component.
 *
 * Displays enrolled passkeys with options to add and revoke.
 *
 * @param props - {@link UserPasskeyMgmtProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.hideHeader - Hide the header section
 * @param props.addAction - Lifecycle hooks for the add passkey operation
 * @param props.revokeAction - Lifecycle hooks for the revoke passkey operation
 * @param props.onFetch - Callback after passkeys are loaded
 * @param props.onErrorAction - Callback when an action errors
 * @returns Passkey management component
 *
 * @see {@link UserPasskeyMgmtProps} for full props documentation
 *
 * @example
 * ```tsx
 * <UserPasskeyMgmt
 *   addAction={{ onAfter: () => console.log('Passkey added') }}
 *   revokeAction={{ onAfter: (passkey) => console.log('Revoked:', passkey.name) }}
 *   onErrorAction={(error, action) => console.error(action, error)}
 * />
 * ```
 */
export { UserPasskeyMgmt, UserPasskeyMgmtView };
