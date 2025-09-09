import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme, useTranslator } from '@/hooks';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormActions } from '@/components/ui/form-actions';
import { Form } from '@/components/ui/form';
import { SettingsDetails } from './settings-details';
import { BrandingDetails } from './branding-details';
import { cn } from '@/lib/theme-utils';
import { OrgDetailsProps } from '@/types';
import {
  OrganizationDetailFormValues,
  getComponentStyles,
  createOrganizationDetailSchema,
  OrganizationDetailSchemaValidation,
} from '@auth0-web-ui-components/core';
import { withCoreClient } from '@/hoc';

/**
 * OrgDetails Component
 *
 * A presentation component that displays organization details including settings and branding fields.
 * This component renders form fields for organization configuration in a structured layout with sections.
 * All data, validation, and business logic are handled via props passed from parent components.
 *
 */
function OrgDetailsComponent({
  organization = {},
  isLoading = false,
  schemaValidation,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  formActions,
}: OrgDetailsProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_details', customMessages);

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const organizationDetailSchema = React.useMemo(() => {
    const mergeFieldConfig = (
      field: keyof OrganizationDetailSchemaValidation,
      defaultError: string,
    ) => {
      const fieldConfig = schemaValidation?.[field];
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
      color: mergeFieldConfig('color', t('sections.branding.fields.primary_color.error')),
      logoURL: mergeFieldConfig('logoURL', t('sections.branding.fields.logo.error')),
    });
  }, [t, schemaValidation]);

  const form = useForm<OrganizationDetailFormValues>({
    resolver: zodResolver(organizationDetailSchema),
    defaultValues: {
      name: organization?.name || '',
      display_name: organization?.display_name || '',
      branding: {
        logo_url: organization?.branding?.logo_url || '',
        colors: {
          primary: organization?.branding?.colors?.primary || '#000000',
          page_background: organization?.branding?.colors?.page_background || '#ffffff',
        },
      },
    },
  });

  const hasUnsavedChanges = form.formState.isDirty;

  const onValid = React.useCallback(
    async (values: OrganizationDetailFormValues) => {
      if (formActions?.nextAction?.onClick) {
        await formActions.nextAction.onClick({
          ...values,
          ...(organization?.id && { id: organization.id }),
        });
      }
    },
    [formActions?.nextAction, organization],
  );

  const handlePreviousAction = React.useCallback(
    (event: Event) => {
      form.reset();
      formActions?.previousAction?.onClick?.(event);
    },
    [form, formActions?.previousAction?.onClick],
  );

  return (
    <div style={currentStyles.variables} className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
          <Card className={cn('p-6', currentStyles.classes?.['OrgDetails-card'])}>
            <div className="space-y-6">
              <SettingsDetails form={form} readOnly={readOnly} customMessages={customMessages} />

              <Separator />

              <BrandingDetails form={form} readOnly={readOnly} customMessages={customMessages} />

              <FormActions
                hasUnsavedChanges={hasUnsavedChanges}
                isLoading={isLoading}
                nextAction={{
                  label: formActions?.nextAction?.label || t('submit_button_label'),
                  disabled:
                    formActions?.nextAction?.disabled ||
                    !hasUnsavedChanges ||
                    isLoading ||
                    readOnly,
                  type: 'submit',
                }}
                previousAction={
                  formActions?.previousAction && {
                    ...formActions.previousAction,
                    onClick: handlePreviousAction,
                  }
                }
                showPrevious={formActions?.showPrevious}
                unsavedChangesText={formActions?.unsavedChangesText || t('unsaved_changes_text')}
                showUnsavedChanges={formActions?.showUnsavedChanges}
                align={formActions?.align}
                className={formActions?.className}
              />
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export const OrgDetails = withCoreClient(OrgDetailsComponent);
