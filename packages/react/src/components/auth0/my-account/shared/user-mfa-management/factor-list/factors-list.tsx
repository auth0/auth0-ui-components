/**
 * MFA enrolled factors list display.
 * @module factors-list
 * @internal
 */

import {
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  getComponentStyles,
} from '@auth0/universal-components-core';
import {
  MoreVertical,
  Trash2,
  Mail,
  Smartphone,
  RectangleEllipsis,
  ShieldCheck,
} from 'lucide-react';
import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { formatDate } from '@/lib/utils/date';
import type { FactorsListProps } from '@/types/my-account/user-mfa-management/factors-list-types';

const FACTOR_TITLE_KEY_TYPES = new Set([FACTOR_TYPE_TOTP, FACTOR_TYPE_PUSH_NOTIFICATION]);

const FACTOR_ICONS = {
  [FACTOR_TYPE_PHONE]: Smartphone,
  [FACTOR_TYPE_EMAIL]: Mail,
  [FACTOR_TYPE_TOTP]: RectangleEllipsis,
  [FACTOR_TYPE_PUSH_NOTIFICATION]: Smartphone,
  [FACTOR_TYPE_RECOVERY_CODE]: ShieldCheck,
} as const;

/**
 *
 * @param props - Component props.
 * @param props.factors - Array of MFA factors
 * @param props.factorType - The MFA factor type
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.isEnabledFactor - Whether the factor is enabled
 * @param props.onDeleteFactor - Callback to delete a factor
 * @param props.isDeletingFactor - Whether a factor deletion is in progress
 * @param props.disableDelete - Whether delete action is disabled
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function FactorsList({
  factors,
  factorType,
  readOnly,
  isEnabledFactor,
  onDeleteFactor,
  isDeletingFactor,
  disableDelete,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: FactorsListProps) {
  const { t } = useTranslator('user_mfa_management', customMessages);
  const { isDarkMode } = useTheme();
  const IconComponent = FACTOR_ICONS[factorType as keyof typeof FACTOR_ICONS];

  const getFactorLabel = (factor: { name?: string; id: string }) => {
    if (factorType === FACTOR_TYPE_RECOVERY_CODE) return t('factors.recovery-code.item_label');
    if (FACTOR_TITLE_KEY_TYPES.has(factorType)) return t(`factors.${factorType}.title`);
    return factor.name || factor.id;
  };

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div className="space-y-2" style={currentStyles?.variables}>
      {factors.map((factor) => {
        const label = getFactorLabel(factor);
        return (
          <Card
            key={factor.id}
            className="border border-[color:var(--color-border)] rounded-lg  bg-transparent p-0 w-full"
            aria-label={label}
          >
            <CardContent className="flex flex-row items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3 min-w-0 flex-grow">
                {IconComponent && (
                  <IconComponent
                    className="w-5 h-5 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0 flex flex-col">
                  <span
                    className="font-medium text-base text-(length:--font-size-body) text-foreground truncate"
                    title={label}
                  >
                    {label}
                  </span>
                  {(factor.created_at || factor.last_auth_at) && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {factor.created_at && (
                        <time dateTime={factor.created_at}>
                          {t('factors.meta.created_at', { date: formatDate(factor.created_at) })}
                        </time>
                      )}
                      {factor.created_at && factor.last_auth_at && ' • '}
                      {factor.last_auth_at && (
                        <time dateTime={factor.last_auth_at}>
                          {t('factors.meta.last_used', { date: formatDate(factor.last_auth_at) })}
                        </time>
                      )}
                    </span>
                  )}
                </div>
              </div>
              {!readOnly && (
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      variant="ghost"
                      size="icon"
                      aria-label={t('actions.menu_aria_label')}
                      className="p-2"
                    >
                      <MoreVertical className="w-5 h-5" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDeleteFactor(factor.id, factorType)}
                          disabled={disableDelete || isDeletingFactor || !isEnabledFactor}
                          aria-label={t('actions.remove_button_label')}
                          className="text-destructive-foreground focus:text-destructive-foreground"
                        >
                          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                          {t('actions.remove_button_label')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
