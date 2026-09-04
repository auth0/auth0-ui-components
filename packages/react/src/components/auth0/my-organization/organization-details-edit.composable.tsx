/**
 * Progressive-composability layer for {@link OrganizationDetailsEdit}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`, `Content`) on
 * top of the existing container/view split, with zero breaking changes to the
 * Tier-1 default usage (`<OrganizationDetailsEdit {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<OrganizationDetailsEdit {...props} />`
 * - Tier 3 (structural): compose `Header` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless): `useOrganizationDetailsEditModel(options)` — see index re-export.
 *
 * HURDLE — no Tier-2 header render-prop for the primary actions:
 * Unlike the SsoProviderTable pilot (whose create action lives in the header and
 * is therefore host-replaceable via a `render` prop), this component's primary
 * Save/Cancel actions are NOT in the header. They live inside the nested
 * `OrganizationDetails` form and are driven by `model.formActions`
 * (`nextAction` = Save, `previousAction` = Cancel). There is no header action
 * slot to host-replace them, so a Tier-2 narrow replacement of Save/Cancel is
 * not available via a header render-prop. A host that needs custom submit UI
 * drops to Tier 4: the model hook exposes `formActions` (plus `updateOrgDetails`,
 * loading flags, and `organization`) so the host can build and wire its own
 * controls. The `Header` part here therefore has no action region by default.
 *
 * @module organization-details-edit.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  OrganizationDetailsEdit as OrganizationDetailsEditDefault,
  OrganizationDetailsEditView,
} from '@/components/auth0/my-organization/organization-details-edit';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext } from '@/lib/composability';
import type {
  OrganizationDetailsEditProps,
  UseOrganizationDetailsEditResult,
} from '@/types/my-organization/organization-management/organization-details-edit-types';

/** Value shared from `Root` to every compound part. */
interface OrganizationDetailsEditComposition {
  model: UseOrganizationDetailsEditResult;
  props: OrganizationDetailsEditProps;
}

const [OrganizationDetailsEditContext, useOrganizationDetailsEditContext] =
  createComponentContext<OrganizationDetailsEditComposition>('OrganizationDetailsEdit');

const DEFAULT_STYLING: NonNullable<OrganizationDetailsEditProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link OrganizationDetailsEditProps} plus children. */
export interface OrganizationDetailsEditRootProps extends OrganizationDetailsEditProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 * @param props - {@link OrganizationDetailsEditRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: OrganizationDetailsEditRootProps) {
  useTelemetry('organization-details');

  const {
    saveAction,
    cancelAction,
    readOnly = false,
    customMessages = {},
    styling = DEFAULT_STYLING,
  } = props;

  const model = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<OrganizationDetailsEditComposition>(
    () => ({ model, props: { ...props, styling, readOnly, customMessages } }),
    [model, props, styling, readOnly, customMessages],
  );

  return (
    <OrganizationDetailsEditContext.Provider value={composition}>
      <GateKeeper isLoading={model.isFetchLoading || model.isLoadingConfig} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </OrganizationDetailsEditContext.Provider>
  );
}

Root.displayName = 'OrganizationDetailsEdit.Root';

/** Props for {@link OrganizationDetailsEditHeader}. */
export interface OrganizationDetailsEditHeaderProps {
  className?: string;
}

/**
 * Title / back-button region. Mirrors the header block of the Tier-1 view: the
 * title is derived from the organization name and the back button (when the host
 * supplied one) gets its localized label. There is no action region — see the
 * module doc HURDLE note on why Save/Cancel are not host-replaceable here.
 * @param props - {@link OrganizationDetailsEditHeaderProps}
 * @returns The header element.
 */
function OrganizationDetailsEditHeader({ className }: OrganizationDetailsEditHeaderProps) {
  const { model, props } = useOrganizationDetailsEditContext();
  const { t } = useTranslator(
    'organization_management.organization_details_edit',
    props.customMessages,
  );

  const organizationName = model.organization.display_name || model.organization.name || '';

  return (
    <div className={className}>
      <Header
        title={t('header.title', { organizationName })}
        backButton={
          props.backButton && {
            ...props.backButton,
            text: t('header.back_button_text'),
          }
        }
      />
    </div>
  );
}

OrganizationDetailsEditHeader.displayName = 'OrganizationDetailsEdit.Header';

/**
 * The form body (organization details form + third-party access). Reuses the
 * existing view with its header suppressed, since the header is owned by the
 * {@link OrganizationDetailsEditHeader} part in composition.
 * @returns The form content.
 */
function Content() {
  const { model, props } = useOrganizationDetailsEditContext();
  return (
    <OrganizationDetailsEditView
      organization={model.organization}
      schema={props.schema}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      readOnly={props.readOnly}
      hideHeader
      backButton={props.backButton}
      formActions={model.formActions}
      showThirdPartyAccess={model.showThirdPartyAccess}
      isThirdPartyAccessReadOnly={model.isThirdPartyAccessReadOnly}
      thirdPartyAccessDefaultValue={model.thirdPartyAccessDefaultValue}
    />
  );
}

Content.displayName = 'OrganizationDetailsEdit.Content';

/**
 * The default anatomy: header → content. Wrapping in `Root` + `DefaultLayout`
 * reproduces the Tier-1 visual output, so hosts can opt into composition
 * incrementally.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  return (
    <>
      <OrganizationDetailsEditHeader />
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'OrganizationDetailsEdit.DefaultLayout';

/**
 * Organization details edit form with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<OrganizationDetailsEdit {...props} />`),
 * and exposes compound parts for structural (Tier 3) composition. For fully
 * headless (Tier 4) usage, see `useOrganizationDetailsEditModel`.
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <OrganizationDetailsEdit.Root {...props}>
 *   <OrganizationDetailsEdit.Header />
 *   <HostGuidancePanel />
 *   <OrganizationDetailsEdit.Content />
 * </OrganizationDetailsEdit.Root>
 * ```
 */
const OrganizationDetailsEdit = Object.assign(OrganizationDetailsEditDefault, {
  Root,
  DefaultLayout,
  Header: OrganizationDetailsEditHeader,
  Content,
});

export {
  OrganizationDetailsEdit,
  Root,
  DefaultLayout,
  OrganizationDetailsEditHeader as Header,
  Content,
  useOrganizationDetailsEditContext,
};
