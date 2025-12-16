import { FACTOR_TYPE_PHONE, FACTOR_TYPE_EMAIL } from '@auth0/universal-components-core';
import { getComponentStyles } from '@auth0/universal-components-core';
import { MoreVertical, Trash2, Mail, Smartphone } from 'lucide-react';
import * as React from 'react';

import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import { cn } from '../../../lib/utils';
import type { FactorsListProps } from '../../../types/my-account/mfa/mfa-types';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';

const FACTOR_ICONS = {
  [FACTOR_TYPE_PHONE]: Smartphone,
  [FACTOR_TYPE_EMAIL]: Mail,
} as const;

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
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const IconComponent = FACTOR_ICONS[factorType as keyof typeof FACTOR_ICONS];

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div className="space-y-2 mt-2" style={currentStyles?.variables}>
      {factors.map((factor) => (
        <Card
          key={factor.id}
          className="border border-[color:var(--color-border)] rounded-lg shadow-none bg-transparent p-0 w-full"
          aria-label={t(`${factorType}.title`)}
        >
          <CardContent className="flex flex-row items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3 min-w-0 flex-grow">
              {IconComponent && (
                <IconComponent
                  className="w-5 h-5 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'font-medium text-base text-(length:--font-size-body) text-foreground truncate',
                )}
                title={factor.name || factor.id}
              >
                {factor.name || factor.id}
              </span>
            </div>
            {!readOnly && (
              <div className="shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('actions')}
                      className="p-2"
                      tabIndex={0}
                    >
                      <MoreVertical className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-30 p-2" role="menu">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center justify-center px-4 py-2 gap-2 text-red-600 font-normal text-sm w-full"
                      onClick={() => onDeleteFactor(factor.id, factorType)}
                      disabled={disableDelete || isDeletingFactor || !isEnabledFactor}
                      aria-label={t('remove')}
                      role="menuitem"
                    >
                      <Trash2 className="w-4 h-4 color-red-10" aria-hidden="true" />
                      <span className="color-red-10">{t('remove')}</span>
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
