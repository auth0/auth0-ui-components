/**
 * Domain creation modal.
 * @module domain-create-modal
 * @internal
 */

import {
  createDomainCreateSchema,
  type InternalDomainCreateFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import { cn } from '@/lib/utils';
import type { DomainCreateModalProps } from '@/types/my-organization/domain-management/domain-create-types';

/**
 *
 * @param props - Component props.
 * @param props.translatorKey - Translation namespace key
 * @param props.className - Optional CSS class name for styling
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.isOpen - Whether the modal/dialog is open
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.schema - Zod validation schema
 * @param props.showDiscoveryOption - Whether to show the "Use for discovery" checkbox
 * @param props.isDiscoveryReadOnly - Whether the checkbox is locked by the discovery policy
 * @param props.canChangeDiscovery - Whether the user has permission to change the checkbox
 * @param props.discoveryDefaultValue - Initial value of the checkbox
 * @param props.onClose - Callback fired when the component should close
 * @param props.onCreate - Callback fired when create action is triggered
 * @returns JSX element
 */
export function DomainCreateModal({
  translatorKey = 'domain_management.domain_create.modal',
  className,
  customMessages,
  isOpen,
  isLoading,
  schema,
  showDiscoveryOption = false,
  isDiscoveryReadOnly = false,
  canChangeDiscovery = true,
  discoveryDefaultValue = false,
  onClose,
  onCreate,
}: DomainCreateModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);

  const isDiscoveryDisabled = isDiscoveryReadOnly || !canChangeDiscovery;

  const getDiscoveryHint = () => {
    if (!canChangeDiscovery) return tCommon('error.forbidden');
    if (isDiscoveryReadOnly) return t('use_for_discovery.locked_hint');
    return null;
  };
  const discoveryHint = getDiscoveryHint();

  const domainCreateSchema = React.useMemo(
    () => createDomainCreateSchema(schema, t('field.error')),
    [schema, t],
  );

  const form = useForm<InternalDomainCreateFormValues>({
    resolver: zodResolver(domainCreateSchema),
    defaultValues: {
      domain_url: '',
      use_for_discovery: discoveryDefaultValue,
    },
    mode: FORM_VALIDATION_MODE,
  });

  const resetForm = React.useCallback(() => {
    form.reset({ domain_url: '', use_for_discovery: discoveryDefaultValue });
  }, [form, discoveryDefaultValue]);

  // The policy can load after the form is created.
  React.useEffect(() => {
    if (!form.formState.isDirty) {
      resetForm();
    }
  }, [form.formState.isDirty, resetForm]);

  const handleCreate = React.useCallback(
    async (values: InternalDomainCreateFormValues) => {
      if (!values.domain_url) return;
      // Without permission the value isn't sent, so the API applies the policy default.
      const shouldSendDiscovery = showDiscoveryOption && canChangeDiscovery;
      if (shouldSendDiscovery) {
        await onCreate(values.domain_url, values.use_for_discovery ?? false);
      } else {
        await onCreate(values.domain_url);
      }
      resetForm();
    },
    [onCreate, resetForm, showDiscoveryOption, canChangeDiscovery],
  );

  const handleClose = React.useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      form.handleSubmit(handleCreate)();
    },
    [form, handleCreate],
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className={cn('p-10', className)}
      title={t('title')}
      content={
        <div>
          <Form {...form}>
            <form id="domain-create-form" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="domain_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="domain-url" className="text-label font-medium">
                      {t('field.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="domain-url"
                        type="text"
                        placeholder={t('field.placeholder')}
                        className="mt-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showDiscoveryOption && (
                <FormField
                  control={form.control}
                  name="use_for_discovery"
                  render={({ field }) => (
                    <FormItem className="mt-4 flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          disabled={isDiscoveryDisabled}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-label font-medium text-foreground peer-disabled:opacity-100">
                          {t('use_for_discovery.label')}
                        </FormLabel>
                        {discoveryHint && (
                          <FormDescription className="text-sm">{discoveryHint}</FormDescription>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
      }
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: t('actions.create_button_text'),
          variant: 'primary',
          disabled: isLoading,
          onClick: (e) => {
            e.preventDefault();
            form.handleSubmit(handleCreate)();
          },
        },
        previousAction: {
          label: t('actions.cancel_button_text'),
          onClick: handleClose,
        },
      }}
    />
  );
}
