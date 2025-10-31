import {
  createDomainCreateSchema,
  type InternalDomainCreateFormValues,
} from '@auth0-web-ui-components/core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { DomainCreateModalProps } from '../../../../types/my-org/domain-management/domain-create-types';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../ui/form';
import { Label } from '../../../ui/label';
import { Modal } from '../../../ui/modal';
import { TextField } from '../../../ui/text-field';

export function DomainCreateModal({
  translatorKey = 'domain_management.domain_create.modal',
  className,
  customMessages,
  isOpen,
  isLoading,
  schema,
  onClose,
  onCreate,
}: DomainCreateModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const domainCreateSchema = React.useMemo(
    () => createDomainCreateSchema(schema, t('field.error')),
    [schema, t],
  );

  const form = useForm<InternalDomainCreateFormValues>({
    resolver: zodResolver(domainCreateSchema),
    defaultValues: {
      domain_url: '',
    },
    mode: 'onChange',
  });

  const handleCreate = React.useCallback(
    async (values: InternalDomainCreateFormValues) => {
      if (!values.domain_url) return;
      await onCreate(values.domain_url);
      form.reset();
    },
    [form, onCreate],
  );

  const handleClose = React.useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className={cn('p-10', className)}
      title={t('title')}
      content={
        <div>
          <Form {...form}>
            <form id="domain-create-form">
              <FormField
                control={form.control}
                name="domain_url"
                render={({ field }) => (
                  <FormItem>
                    <Label
                      htmlFor="domain-url"
                      className="text-sm text-(length:--font-size-label) font-medium"
                    >
                      {t('field.label')}
                    </Label>
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
            </form>
          </Form>
        </div>
      }
      modalActions={{
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
