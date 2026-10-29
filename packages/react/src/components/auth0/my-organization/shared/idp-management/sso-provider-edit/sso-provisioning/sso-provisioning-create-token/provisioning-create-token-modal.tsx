/**
 * SCIM token creation modal: configure step, then one-time reveal step.
 * @module provisioning-create-token-modal
 * @internal
 */

import {
  createProvisioningCreateTokenSchema,
  SCIM_TOKEN_MIN_LIFETIME_SECONDS,
  SsoProvisioningMappers,
  type ProvisioningCreateTokenFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Copy } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { ProvisioningCreateTokenForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-form';
import { ProvisioningCreateTokenModalContent } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-modal-content';
import { WizardStepper } from '@/components/auth0/shared/wizard-stepper';
import { Form } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import type { ProvisioningCreateTokenModalProps } from '@/types/my-organization/idp-management/sso-provisioning/provisioning-manage-token-types';

/**
 * @param props - Component props.
 * @param props.open - Whether the component is open/visible
 * @param props.onOpenChange - Callback fired when open state changes
 * @param props.createdToken - Newly created token data; when set, the modal shows step 2
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.scimTokenConfig - Connection Profile `provisioning.scim.tokens`
 * @param props.onCreate - Callback to create the token from the form request
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ProvisioningCreateTokenModal({
  open,
  onOpenChange,
  createdToken,
  isLoading,
  scimTokenConfig,
  onCreate,
  customMessages = {},
}: ProvisioningCreateTokenModalProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.manage_tokens',
    customMessages,
  );

  const rules = React.useMemo(
    () => SsoProvisioningMappers.getCreateTokenFormRules(scimTokenConfig),
    [scimTokenConfig],
  );

  const schema = React.useMemo(
    () =>
      createProvisioningCreateTokenSchema(rules, {
        required: t('create_modal.fields.token_lifetime.errors.required'),
        integer: t('create_modal.fields.token_lifetime.errors.integer'),
        min: t('create_modal.fields.token_lifetime.errors.min', {
          seconds: String(SCIM_TOKEN_MIN_LIFETIME_SECONDS),
        }),
        max: t('create_modal.fields.token_lifetime.errors.max', {
          seconds: String(rules.maxAllowedExpiry ?? ''),
        }),
        scopesRequired: t('create_modal.fields.scopes.errors.required'),
      }),
    [rules, t],
  );

  const form = useForm<ProvisioningCreateTokenFormValues>({
    resolver: zodResolver(schema),
    mode: FORM_VALIDATION_MODE,
    defaultValues: SsoProvisioningMappers.getCreateTokenFormDefaults(rules),
  });

  const hasToken = !!createdToken;
  const { reset } = form;
  React.useEffect(() => {
    if (open && !hasToken) {
      reset(SsoProvisioningMappers.getCreateTokenFormDefaults(rules));
    }
  }, [open, hasToken, rules, reset]);

  const hasScope = form.watch('scopes').length > 0;

  const { isSubmitting } = form.formState;

  const submit = async () => {
    if (isLoading || isSubmitting || !hasScope) return;
    await form.handleSubmit(async (values) => {
      await onCreate(SsoProvisioningMappers.createScimTokenToAPI(values));
    })();
  };

  const steps = [
    { id: 'configure', title: t('create_modal.steps.configure') },
    { id: 'review', title: t('create_modal.steps.review') },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('create_modal.title')}
      content={
        <div className="space-y-6">
          <WizardStepper steps={steps} currentStep={createdToken ? 1 : 0} />
          {createdToken ? (
            <ProvisioningCreateTokenModalContent
              token={createdToken.token!}
              tokenId={createdToken.token_id}
              customMessages={customMessages.create_modal?.content}
            />
          ) : (
            <Form {...form}>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
              >
                <ProvisioningCreateTokenForm
                  form={form}
                  rules={rules}
                  customMessages={customMessages.create_modal?.fields}
                />
              </form>
            </Form>
          )}
        </div>
      }
      modalActions={{
        isLoading,
        showPrevious: false,
        showUnsavedChanges: false,
        nextAction: createdToken
          ? {
              type: 'button',
              label: t('create_modal.copy_and_close_button_label'),
              variant: 'primary',
              icon: <Copy className="w-4 h-4" />,
              disabled: isLoading,
              onClick: () => {
                navigator.clipboard.writeText(createdToken.token!);
                onOpenChange(false);
              },
            }
          : {
              type: 'button',
              label: t('create_modal.next_button_label'),
              variant: 'primary',
              icon: <ArrowRight className="w-4 h-4" />,
              disabled: isLoading || isSubmitting || !hasScope,
              onClick: () => {
                void submit();
              },
            },
      }}
    />
  );
}
