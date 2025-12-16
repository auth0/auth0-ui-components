import type {
  OrganizationDetailsFormValues,
  OrganizationPrivate,
  OrganizationDetailsSchemas,
} from '@auth0/universal-components-core';
import {
  getComponentStyles,
  createOrganizationDetailSchema,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useTheme } from '../../../../hooks/use-theme';
import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { OrganizationDetailsProps } from '../../../../types/my-org/org-management/org-details-types';
import { Card } from '../../../ui/card';
import { Form } from '../../../ui/form';
import { FormActions } from '../../../ui/form-actions';
import { Separator } from '../../../ui/separator';
import { Spinner } from '../../../ui/spinner';

import { BrandingDetails } from './branding-details';
import { SettingsDetails } from './settings-details';

/**
 * OrgDetails Component
 *
 * A presentation component that displays organization details including settings and branding fields.
 * This component renders form fields for organization configuration in a structured layout with sections.
 * All data, validation, and business logic are handled via props passed from parent components.
 *
 */
export function OrgDetails({
  organization,
  isLoading = false,
  schema,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  formActions,
}: OrganizationDetailsProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_details', customMessages);

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const organizationDetailSchema = React.useMemo(() => {
    const mergeFieldConfig = (field: keyof OrganizationDetailsSchemas, defaultError: string) => {
      const fieldConfig = schema?.[field];
      return fieldConfig
        ? {
            ...fieldConfig,
            errorMessage: fieldConfig.errorMessage || defaultError,
          }
        : {
            errorMessage: defaultError,
          };
    };

    return createOrganizationDetailSchema({
      name: mergeFieldConfig('name', t('sections.settings.fields.name.error')),
      displayName: mergeFieldConfig(
        'displayName',
        t('sections.settings.fields.display_name.error'),
      ),
      primaryColor: mergeFieldConfig(
        'primaryColor',
        t('sections.branding.fields.primary_color.error'),
      ),
      logoURL: mergeFieldConfig('logoURL', t('sections.branding.fields.logo.error')),
      backgroundColor: mergeFieldConfig(
        'backgroundColor',
        t('sections.branding.fields.page_background_color.error'),
      ),
    });
  }, [t, schema]);

  const formValues = React.useMemo(
    (): OrganizationDetailsFormValues => ({
      name: organization.name,
      display_name: organization.display_name,
      branding: {
        logo_url: organization.branding.logo_url,
        colors: {
          primary: organization.branding.colors.primary,
          page_background: organization.branding.colors.page_background,
        },
      },
    }),
    [organization],
  );

  const form = useForm<OrganizationDetailsFormValues>({
    resolver: zodResolver(organizationDetailSchema),
    defaultValues: formValues,
    values: formValues,
  });

  const hasUnsavedChanges = form.formState.isDirty;

  const onValid = React.useCallback(
    async (values: OrganizationDetailsFormValues) => {
      if (formActions?.nextAction?.onClick) {
        const payload: OrganizationPrivate = {
          ...values,
          id: organization.id,
        };

        const success = await formActions.nextAction.onClick(payload);

        if (success) {
          form.reset(values, {
            keepValues: true,
            keepDirty: false,
            keepTouched: false,
          });
        }
      }
    },
    [formActions?.nextAction, organization.id, form],
  );

  const handlePreviousAction = React.useCallback(
    (event: Event) => {
      form.reset();
      formActions?.previousAction?.onClick?.(event);
    },
    [form, formActions?.previousAction?.onClick],
  );

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <div style={currentStyles.variables} className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
          <Card
            data-testid="org-details-card"
            className={cn('p-6', currentStyles.classes?.OrgDetails_Card)}
          >
            <div className="space-y-6">
              <SettingsDetails
                form={form}
                readOnly={readOnly}
                customMessages={customMessages}
                className={currentStyles.classes?.OrgDetails_SettingsDetails}
              />

              <Separator />

              <BrandingDetails
                form={form}
                readOnly={readOnly}
                customMessages={customMessages}
                className={currentStyles.classes?.OrgDetails_BrandingDetails}
              />

              <FormActions
                hasUnsavedChanges={hasUnsavedChanges}
                isLoading={formActions.isLoading}
                nextAction={{
                  label: t('submit_button_label'),
                  disabled:
                    formActions?.nextAction?.disabled ||
                    !hasUnsavedChanges ||
                    formActions.isLoading ||
                    readOnly,
                  type: 'submit',
                }}
                previousAction={{
                  label: t('cancel_button_label'),
                  disabled:
                    formActions?.previousAction?.disabled || formActions.isLoading || readOnly,
                  onClick: handlePreviousAction,
                }}
                showPrevious={formActions?.showPrevious}
                unsavedChangesText={t('unsaved_changes_text')}
                showUnsavedChanges={formActions?.showUnsavedChanges}
                align={formActions?.align}
                className={currentStyles.classes?.OrgDetails_FormActions}
              />
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
