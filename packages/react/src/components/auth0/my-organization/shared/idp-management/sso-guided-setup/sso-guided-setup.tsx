/**
 * Guided setup card: strategy, vertical stepper of instruction pages, the current page and its
 * actions.
 * @module sso-guided-setup
 * @internal
 */

import {
  getInstructionsLocale,
  type IdpInstructionsPage,
  type IdpProvisioningInstructionsPage,
  STRATEGY_DISPLAY_NAMES,
  type IdpKnownResponse,
  type IdpStrategy,
  type InstructionsEntryContext,
  type InstructionsKind,
  type SsoGuidedSetupMessages,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { InstructionsPage } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instructions-page';
import { SsoGuidedSetupProvider } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-context';
import { SsoGuidedSetupCreateModal } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-create-modal';
import { SsoStrategyIcon } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-strategy-icon';
import { FormActions } from '@/components/auth0/shared/form-actions';
import { WizardStepper } from '@/components/auth0/shared/wizard-stepper';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useIdpInstructionsService } from '@/hooks/my-organization/shared/services/use-idp-instructions-service';
import { useGuidedSetupFlow } from '@/hooks/my-organization/use-guided-setup-flow';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  InstructionRenderers,
  SsoGuidedSetupContextValue,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

export interface SsoGuidedSetupProps
  extends Pick<
    SsoGuidedSetupContextValue,
    | 'connectionName'
    | 'companyName'
    | 'provider'
    | 'resolveSamlMetadata'
    | 'configure'
    | 'attributeMappings'
    | 'slots'
  > {
  strategy: IdpStrategy;
  kind?: InstructionsKind;
  mode?: 'create' | 'edit';
  entryContext?: Partial<InstructionsEntryContext>;
  googleWorkspaceSetupComplete?: boolean;
  initialPageKey?: string;
  renderers?: InstructionRenderers;
  enabled?: boolean;
  isSubmitting?: boolean;
  onBeforeCreate?: () => Promise<boolean> | boolean;
  onCreateProvider?: () => Promise<boolean>;
  onSaveConnection?: () => Promise<boolean>;
  onComplete?: () => void;
  customMessages?: Partial<SsoGuidedSetupMessages>;
  className?: string;
}

/**
 * Guided setup for one strategy. Loads the instructions, shows the visible pages in a vertical
 * stepper and renders the current page. On the page whose exit condition is `connection_exists`
 * the primary action creates the provider (after confirmation) or, when it exists, saves it.
 *
 * Entry condition defaults: `if_mapping_present` is true when the provider has attribute
 * mappings, and before the provider exists (mapping data before creation is not available yet).
 * `if_group_provisioning_enabled` defaults to false.
 * @param props - {@link SsoGuidedSetupProps}
 * @returns JSX element
 */
export function SsoGuidedSetup({
  strategy,
  kind = 'creation',
  mode = 'create',
  connectionName,
  companyName,
  provider = null,
  resolveSamlMetadata,
  configure,
  attributeMappings,
  slots,
  entryContext,
  googleWorkspaceSetupComplete = false,
  initialPageKey,
  renderers,
  enabled = true,
  isSubmitting = false,
  onBeforeCreate,
  onCreateProvider,
  onSaveConnection,
  onComplete,
  customMessages = {},
  className,
}: SsoGuidedSetupProps) {
  const { t, currentLanguage } = useTranslator('idp_management.sso_guided_setup', customMessages);

  const { instructions, isLoading, error } = useIdpInstructionsService({
    kind,
    strategy,
    locale: getInstructionsLocale(currentLanguage),
    enabled,
  });

  const pages: readonly InstructionsPageItem[] = instructions?.pages ?? EMPTY_PAGES;
  const providerAttributes = getProviderAttributes(provider);

  const resolvedEntryContext = React.useMemo<InstructionsEntryContext>(
    () => ({
      hasMappings: entryContext?.hasMappings ?? (provider ? providerAttributes.length > 0 : true),
      groupProvisioningEnabled: entryContext?.groupProvisioningEnabled ?? false,
    }),
    [
      entryContext?.hasMappings,
      entryContext?.groupProvisioningEnabled,
      provider,
      providerAttributes.length,
    ],
  );

  const exitState = React.useMemo(
    () => ({ connectionExists: Boolean(provider), googleWorkspaceSetupComplete }),
    [provider, googleWorkspaceSetupComplete],
  );

  const connectionPageKey = pages.find((page) => page.exit_condition === 'connection_exists')?.key;

  const flow = useGuidedSetupFlow({
    pages,
    entryContext: resolvedEntryContext,
    exitState,
    initialPageKey: initialPageKey ?? (mode === 'edit' ? connectionPageKey : undefined),
  });

  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  const [isCreating, setCreating] = React.useState(false);
  const [advanceWhenCreated, setAdvanceWhenCreated] = React.useState(false);

  // After a successful create the parent passes the provider in; then the page can be left.
  React.useEffect(() => {
    if (advanceWhenCreated && provider) {
      setAdvanceWhenCreated(false);
      flow.goNext();
    }
  }, [advanceWhenCreated, provider, flow]);

  const company = companyName || t('company_fallback');
  const currentPage = flow.currentPage;
  const isConnectionPage = currentPage?.exit_condition === 'connection_exists';
  const needsCreate = isConnectionPage && !provider;

  const handlePrimary = async () => {
    if (needsCreate) {
      const canCreate = onBeforeCreate ? await onBeforeCreate() : true;
      if (canCreate) setConfirmOpen(true);
      return;
    }
    if (isConnectionPage && onSaveConnection) {
      const saved = await onSaveConnection();
      if (!saved) return;
    }
    if (flow.isLastPage) {
      onComplete?.();
      return;
    }
    flow.goNext();
  };

  const handleProceed = async () => {
    setCreating(true);
    try {
      const created = onCreateProvider ? await onCreateProvider() : false;
      if (created) {
        setConfirmOpen(false);
        setAdvanceWhenCreated(true);
      }
    } finally {
      setCreating(false);
    }
  };

  let primaryLabel = t('next');
  if (needsCreate) primaryLabel = t('create_provider');
  else if (flow.isLastPage) primaryLabel = t('done');

  const contextValue = React.useMemo<SsoGuidedSetupContextValue>(
    () => ({
      kind,
      strategy,
      mode,
      baseUrl: instructions?.base_url,
      tenant: instructions?.tenant,
      connectionName,
      companyName: company,
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
      mode,
      instructions?.base_url,
      instructions?.tenant,
      connectionName,
      company,
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
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !currentPage) {
    return (
      <Card className={className} data-slot="sso-guided-setup">
        <CardContent>
          <p className="text-sm text-muted-foreground" role="status">
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

        <section className="min-w-0 space-y-6" aria-labelledby="sso-guided-setup-page-title">
          <h3 id="sso-guided-setup-page-title" className="text-lg font-medium text-foreground">
            {currentPage.title}
          </h3>

          <SsoGuidedSetupProvider value={contextValue}>
            <InstructionsPage page={currentPage} renderers={renderers} />
          </SsoGuidedSetupProvider>

          <FormActions
            align="right"
            hasUnsavedChanges
            isLoading={isSubmitting}
            showPrevious={!flow.isFirstPage}
            previousAction={{ label: t('back'), variant: 'outline', onClick: flow.goBack }}
            nextAction={{
              type: 'button',
              label: primaryLabel,
              variant: 'primary',
              onClick: handlePrimary,
            }}
          />
        </section>
      </CardContent>

      <SsoGuidedSetupCreateModal
        open={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onProceed={handleProceed}
        isCreating={isCreating || isSubmitting}
        companyName={company}
        customMessages={customMessages}
      />
    </Card>
  );
}

type InstructionsPageItem = IdpInstructionsPage | IdpProvisioningInstructionsPage;

const EMPTY_PAGES: InstructionsPageItem[] = [];

/**
 * Attribute mappings of a provider, for strategies whose response carries them.
 * @param provider - Provider, if any.
 * @returns The mappings, or an empty list.
 */
function getProviderAttributes(provider: IdpKnownResponse | null): unknown[] {
  if (!provider || !('attributes' in provider)) return [];
  return Array.isArray(provider.attributes) ? provider.attributes : [];
}
