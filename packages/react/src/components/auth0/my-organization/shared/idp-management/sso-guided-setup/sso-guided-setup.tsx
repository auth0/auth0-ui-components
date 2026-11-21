/**
 * Guided setup card.
 * @module sso-guided-setup
 * @internal
 */

import { STRATEGY_DISPLAY_NAMES } from '@auth0/universal-components-core';
import * as React from 'react';

import { InstructionsPage } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instructions-page';
import { SsoGuidedSetupCreateModal } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-create-modal';
import { SsoStrategyIcon } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-strategy-icon';
import { FormActions } from '@/components/auth0/shared/form-actions';
import { WizardStepper } from '@/components/auth0/shared/wizard-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useGuidedSetupCreation } from '@/hooks/my-organization/idp-management/sso-guided-setup/use-guided-setup-creation';
import { useGuidedSetupPages } from '@/hooks/my-organization/idp-management/sso-guided-setup/use-guided-setup-pages';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { useId } from '@/lib/utils/use-id-compat';
import type {
  InstructionSetup,
  SsoGuidedSetupProps,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Guided setup for one strategy: a stepper of instruction pages and the current page's actions.
 * @param props - {@link SsoGuidedSetupProps}
 * @returns JSX element
 */
export function SsoGuidedSetup({
  strategy,
  kind = 'creation',
  connectionName,
  provider = null,
  resolveSamlMetadata,
  configure,
  attributeMappings,
  slots,
  entryContext,
  initialPageKey,
  renderers,
  enabled = true,
  isSubmitting = false,
  onBeforeCreate,
  onCreateProvider,
  onComplete,
  customMessages = {},
  className,
}: SsoGuidedSetupProps) {
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);

  const { flow, isLoading, error, companyName } = useGuidedSetupPages({
    kind,
    strategy,
    enabled,
    provider,
    attributeMappings,
    entryContext,
    initialPageKey,
  });
  const creation = useGuidedSetupCreation({
    flow,
    provider,
    onBeforeCreate,
    onCreateProvider,
    onComplete,
  });
  const currentPage = flow.currentPage;
  const pageTitleId = useId();
  const pageTitleRef = React.useRef<HTMLHeadingElement>(null);
  const shownPageKey = React.useRef(currentPage?.key);

  React.useEffect(() => {
    const previousKey = shownPageKey.current;
    shownPageKey.current = currentPage?.key;
    if (previousKey && previousKey !== currentPage?.key) pageTitleRef.current?.focus();
  }, [currentPage?.key]);

  const setup = React.useMemo<InstructionSetup>(
    () => ({
      kind,
      strategy,
      connectionName,
      provider,
      resolveSamlMetadata,
      configure,
      attributeMappings,
      slots,
      customMessages,
    }),
    [
      kind,
      strategy,
      connectionName,
      provider,
      resolveSamlMetadata,
      configure,
      attributeMappings,
      slots,
      customMessages,
    ],
  );

  if (isLoading) {
    return (
      <Card className={className} data-slot="sso-guided-setup">
        <CardContent
          role="status"
          aria-live="polite"
          aria-label={t('loading')}
          className="flex items-center justify-center min-h-[200px]"
        >
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !currentPage) {
    return (
      <Card className={className} data-slot="sso-guided-setup">
        <CardContent>
          <p className="text-sm text-muted-foreground" role={error ? 'alert' : 'status'}>
            {error ? t('load_error') : t('unavailable')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('p-0', className)} data-slot="sso-guided-setup">
      <CardContent className="grid gap-8 p-6 md:grid-cols-[minmax(160px,220px)_1fr]">
        <nav aria-label={t('stepper_label')} className="space-y-4">
          <div className="flex items-center gap-2">
            <SsoStrategyIcon strategy={strategy} className="w-5 h-5 shrink-0 text-primary" />
            <span className="text-base font-medium">{STRATEGY_DISPLAY_NAMES[strategy]}</span>
          </div>
          <WizardStepper
            orientation="vertical"
            steps={flow.visiblePages.map((page) => ({ id: page.key, title: page.title }))}
            currentStep={flow.currentIndex}
            onStepClick={(index) => flow.goToPage(index)}
          />
        </nav>

        <section className="min-w-0 space-y-6" aria-labelledby={pageTitleId}>
          <div className="space-y-2">
            <h3
              ref={pageTitleRef}
              id={pageTitleId}
              data-slot="sso-guided-setup-page-title"
              tabIndex={-1}
              className="text-lg font-medium text-foreground outline-none"
            >
              {currentPage.title}
            </h3>

            <InstructionsPage
              page={currentPage}
              setup={setup}
              renderers={renderers}
              className="[&>[data-slot=markdown]:first-child>p:first-child]:text-foreground [&>[data-slot=markdown]:first-child>p:first-child:not(:last-child)]:mb-6"
            />
          </div>

          <FormActions
            align="right"
            isLoading={isSubmitting}
            showPrevious={false}
            showUnsavedChanges={false}
            nextAction={{
              type: 'button',
              label: t(creation.primaryLabelKey),
              variant: 'primary',
              disabled: creation.isPrimaryDisabled,
              onClick: creation.handlePrimary,
            }}
          />
        </section>
      </CardContent>

      <SsoGuidedSetupCreateModal
        open={creation.isConfirmOpen}
        onOpenChange={creation.setConfirmOpen}
        onProceed={creation.handleProceed}
        isCreating={creation.isCreating || isSubmitting}
        companyName={companyName}
        customMessages={customMessages}
      />
    </Card>
  );
}
