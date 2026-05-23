/** @module user-passkey-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import { MoreVertical, SquarePen, Trash2, UserRoundKey } from 'lucide-react';
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
  CardAdornment,
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
 * @param props.renameAction - Configuration for the rename passkey action
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
    renameAction,
    onFetch,
    onErrorAction,
  } = props;

  const {
    passkeys,
    isLoading,
    isEnrolling,
    isRevoking,
    isRenaming,
    error,
    disableAdd,
    disableRename,
    disableRevoke,
    isRevokeDialogOpen,
    isRenameDialogOpen,
    currentPasskey,
    setIsRevokeDialogOpen,
    setIsRenameDialogOpen,
    handleAddPasskey,
    handleRevokePasskey,
    handleRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
  } = useUserPasskey({
    customMessages,
    addAction,
    revokeAction,
    renameAction,
    onFetch,
    onErrorAction,
  });

  return (
    <GateKeeper isLoading={isLoading} styling={styling}>
      <UserPasskeyMgmtView
        passkeys={passkeys}
        isEnrolling={isEnrolling}
        isRevoking={isRevoking}
        isRenaming={isRenaming}
        error={error}
        styling={styling}
        customMessages={customMessages}
        hideHeader={hideHeader}
        disableAdd={disableAdd}
        disableRename={disableRename}
        disableRevoke={disableRevoke}
        isRevokeDialogOpen={isRevokeDialogOpen}
        isRenameDialogOpen={isRenameDialogOpen}
        currentPasskey={currentPasskey}
        handleAddPasskey={handleAddPasskey}
        handleRevokePasskey={handleRevokePasskey}
        handleRenamePasskey={handleRenamePasskey}
        handleConfirmRevoke={handleConfirmRevoke}
        handleConfirmRename={handleConfirmRename}
        setIsRevokeDialogOpen={setIsRevokeDialogOpen}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
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
    isRenaming,
    error,
    styling,
    customMessages,
    hideHeader,
    disableAdd,
    disableRename,
    disableRevoke,
    isRevokeDialogOpen,
    isRenameDialogOpen,
    currentPasskey,
    handleAddPasskey,
    handleRevokePasskey,
    handleRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
    setIsRevokeDialogOpen,
    setIsRenameDialogOpen,
  } = props;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('passkey', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const hasPasskeys = passkeys.length > 0;

  const handleDialogClose = React.useCallback(
    () => setIsRevokeDialogOpen(false),
    [setIsRevokeDialogOpen],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      {!hideHeader && <Header title={t('title')} description={t('description')} />}

      <Card className={cn(currentStyles.classes?.['UserPasskeyMgmt-root'])}>
        {error ? (
          <CardContent>
            <div
              className="flex flex-col items-center justify-center p-4 space-y-2"
              role="alert"
              aria-live="assertive"
            >
              <h1 className="text-base font-medium text-center text-destructive-foreground">
                {t('component_error_title')}
              </h1>
              <p className="text-sm text-center text-destructive-foreground whitespace-pre-line">
                {t('component_error_description')}
              </p>
            </div>
          </CardContent>
        ) : (
          <>
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
                    aria-label={t('add_passkey')}
                  >
                    {t('add_passkey')}
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
                    <CardHeader>
                      <CardAdornment>
                        <UserRoundKey
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </CardAdornment>
                      <CardTitle className="text-base text-(length:--font-size-body) font-semibold text-card-foreground">
                        {passkey.name}
                      </CardTitle>
                      {passkey.createdAt && (
                        <CardDescription>
                          {t('created_at', {
                            date: new Date(passkey.createdAt).toLocaleDateString(),
                          })}
                        </CardDescription>
                      )}
                      {(!disableRename || !disableRevoke) && (
                        <CardAction>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-xl bg-primary border border-primary/20 shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <MoreVertical className="h-4 w-4 text-primary-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuContent align="end">
                                {!disableRename && (
                                  <DropdownMenuItem onClick={() => handleRenamePasskey(passkey)}>
                                    <SquarePen className="mr-2 h-4 w-4" />
                                    {t('rename')}
                                  </DropdownMenuItem>
                                )}
                                {!disableRevoke && (
                                  <DropdownMenuItem
                                    onClick={() => handleRevokePasskey(passkey)}
                                    className="text-destructive-foreground focus:text-destructive-foreground"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('revoke')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenuPortal>
                          </DropdownMenu>
                        </CardAction>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </CardContent>
            )}
          </>
        )}
      </Card>

      <PasskeyActionModal
        mode="revoke"
        open={isRevokeDialogOpen}
        onOpenChange={setIsRevokeDialogOpen}
        isPending={isRevoking}
        onConfirm={handleConfirmRevoke}
        onCancel={handleDialogClose}
        name={currentPasskey?.name}
        styling={styling}
        customMessages={customMessages?.revoke_dialog}
      />

      <PasskeyActionModal
        mode="rename"
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        isPending={isRenaming}
        onConfirm={handleConfirmRename}
        onCancel={handleDialogClose}
        name={currentPasskey?.name}
        styling={styling}
        customMessages={customMessages?.rename_dialog}
      />
    </StyledScope>
  );
}

/**
 * Passkey management component.
 *
 * Displays enrolled passkeys with options to add, rename, and revoke.
 *
 * @param props - {@link UserPasskeyMgmtProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.hideHeader - Hide the header section
 * @param props.addAction - Lifecycle hooks for the add passkey operation
 * @param props.revokeAction - Lifecycle hooks for the revoke passkey operation
 * @param props.renameAction - Lifecycle hooks for the rename passkey operation
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
 *   renameAction={{ onAfter: (passkey, name) => console.log('Renamed to:', name) }}
 *   onErrorAction={(error, action) => console.error(action, error)}
 * />
 * ```
 */
export { UserPasskeyMgmt, UserPasskeyMgmtView };
