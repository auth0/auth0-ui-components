/** @module user-passkey-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import * as React from 'react';

import { PasskeyActionDialog } from '@/components/auth0/my-account/shared/passkey/passkey-action-dialog';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { List, ListItem } from '@/components/ui/list';
import { Spinner } from '@/components/ui/spinner';
import { useUserPasskey } from '@/hooks/my-account/use-user-passkey';
import { useUserPasskeyService } from '@/hooks/my-account/use-user-passkey-service';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  Passkey,
  UserPasskeyMgmtViewProps,
  UserPasskeyMgmtProps,
} from '@/types/my-account/passkey/passkey-types';

/**
 * UserPasskeyMgmtContainer — logic/container component.
 * @internal
 * @param props - {@link UserPasskeyMgmtProps}
 * @returns Container component
 */
function UserPasskeyMgmtContainer(props: UserPasskeyMgmtProps) {
  const {
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    hideHeader = false,
    disableAdd = false,
    disableRename = false,
    disableRevoke = false,
    onSuccess,
    onFetch,
    onError,
  } = props;

  const readOnly = disableAdd && disableRename && disableRevoke;

  const { fetchPasskeys, enrollPasskey, revokePasskey, renamePasskey } = useUserPasskeyService();

  const {
    passkeys,
    isLoading,
    isEnrolling,
    isRevoking,
    isRenaming,
    error,
    isRevokeDialogOpen,
    passkeyToRevoke,
    isRenameDialogOpen,
    passkeyToRename,
    setIsRevokeDialogOpen,
    setIsRenameDialogOpen,
    loadPasskeys,
    onAddPasskey,
    onRevokePasskey,
    onRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
  } = useUserPasskey({
    readOnly,
    disableAdd,
    disableRename,
    disableRevoke,
    customMessages,
    fetchPasskeys,
    enrollPasskey,
    revokePasskey,
    renamePasskey,
    onFetch,
    onSuccess,
    onError,
  });

  React.useEffect(() => {
    loadPasskeys();
  }, []);

  return (
    <UserPasskeyMgmtView
      passkeys={passkeys}
      isLoading={isLoading}
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
      readOnly={readOnly}
      isRevokeDialogOpen={isRevokeDialogOpen}
      passkeyToRevoke={passkeyToRevoke}
      isRenameDialogOpen={isRenameDialogOpen}
      passkeyToRename={passkeyToRename}
      onAddPasskey={onAddPasskey}
      onRevokePasskey={onRevokePasskey}
      onRenamePasskey={onRenamePasskey}
      handleConfirmRevoke={handleConfirmRevoke}
      handleConfirmRename={handleConfirmRename}
      setIsRevokeDialogOpen={setIsRevokeDialogOpen}
      setIsRenameDialogOpen={setIsRenameDialogOpen}
    />
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
    isLoading,
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
    readOnly,
    isRevokeDialogOpen,
    passkeyToRevoke,
    isRenameDialogOpen,
    passkeyToRename,
    onAddPasskey,
    onRevokePasskey,
    onRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
    setIsRevokeDialogOpen,
    setIsRenameDialogOpen,
  } = props;

  const { loader, isDarkMode } = useTheme();
  const { t } = useTranslator('passkey', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const hasPasskeys = passkeys.length > 0;

  return (
    <StyledScope style={currentStyles.variables}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">{loader || <Spinner />}</div>
      ) : (
        <Card
          className={cn(
            'py-10 px-8 sm:py-8 sm:px-6',
            currentStyles.classes?.['UserPasskeyMgmt-card'],
          )}
        >
          <CardContent>
            {error ? (
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
            ) : (
              <>
                {!hideHeader && (
                  <>
                    <CardTitle
                      id="passkey-management-title"
                      className="text-2xl text-(length:--font-size-heading) font-medium text-left"
                    >
                      {t('title')}
                    </CardTitle>
                    <CardDescription
                      id="passkey-management-desc"
                      className="text-sm text-(length:--font-size-paragraph) text-muted-foreground text-left"
                    >
                      {t('description')}
                    </CardDescription>
                  </>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-base text-(length:--font-size-body) font-medium text-card-foreground">
                      {t('section_title')}
                    </span>
                    {hasPasskeys && (
                      <Badge
                        variant="success"
                        size="sm"
                        className="shrink-0"
                        aria-label={t('enabled')}
                      >
                        {t('enabled')}
                      </Badge>
                    )}
                  </div>

                  {!readOnly && !disableAdd && (
                    <Button
                      size="default"
                      variant="outline"
                      className="text-sm w-full sm:w-auto shrink-0"
                      onClick={onAddPasskey}
                      disabled={isEnrolling}
                      aria-label={t('add_passkey')}
                    >
                      {t('add_passkey')}
                    </Button>
                  )}
                </div>

                {hasPasskeys ? (
                  <List
                    className="flex flex-col gap-2 w-full mt-2"
                    aria-labelledby="passkey-management-title"
                  >
                    {passkeys.map((passkey: Passkey) => (
                      <ListItem
                        key={passkey.id}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex flex-col min-w-0">
                            {passkey.name && (
                              <span className="text-sm font-medium text-card-foreground truncate">
                                {passkey.name}
                              </span>
                            )}
                            {passkey.createdAt && (
                              <span className="text-xs text-muted-foreground">
                                {t('created_at', {
                                  date: new Date(passkey.createdAt).toLocaleDateString(),
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {!readOnly && (!disableRename || !disableRevoke) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              aria-label={t('actions')}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuContent align="end">
                                {!disableRename && (
                                  <DropdownMenuItem onClick={() => onRenamePasskey(passkey)}>
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    {t('rename')}
                                  </DropdownMenuItem>
                                )}
                                {!disableRevoke && (
                                  <DropdownMenuItem
                                    onClick={() => onRevokePasskey(passkey)}
                                    className="text-destructive-foreground focus:text-destructive-foreground"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground" />
                                    {t('revoke')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenuPortal>
                          </DropdownMenu>
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <p className="text-sm text-(length:--font-size-paragraph) text-muted-foreground mt-2">
                    {t('no_passkeys')}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <PasskeyActionDialog
        mode="revoke"
        open={isRevokeDialogOpen}
        onOpenChange={(open: boolean) => !isRevoking && setIsRevokeDialogOpen(open)}
        isPending={isRevoking}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setIsRevokeDialogOpen(false)}
        passKeyName={passkeyToRevoke?.name}
        styling={styling}
        customMessages={customMessages}
      />

      <PasskeyActionDialog
        mode="rename"
        open={isRenameDialogOpen}
        onOpenChange={(open: boolean) => !isRenaming && setIsRenameDialogOpen(open)}
        isPending={isRenaming}
        onConfirm={handleConfirmRename}
        onCancel={() => setIsRenameDialogOpen(false)}
        initialName={passkeyToRename?.name}
        styling={styling}
        customMessages={customMessages}
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
 * @returns Passkey management component
 *
 * @example
 * ```tsx
 * <UserPasskeyMgmt
 *   onSuccess={(action) => console.log('Passkey action succeeded:', action)}
 *   onError={(error, action) => console.error('Passkey action failed:', action, error)}
 * />
 * ```
 */
const UserPasskeyMgmt = UserPasskeyMgmtContainer;

export { UserPasskeyMgmt, UserPasskeyMgmtView };
