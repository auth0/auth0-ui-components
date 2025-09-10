import type {
  OrganizationDetailFormValues,
  OrganizationDetailSchemaValidation,
} from '@auth0-web-ui-components/core';
import { getComponentStyles, createOrganizationDetailSchema } from '@auth0-web-ui-components/core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormActions } from '@/components/ui/form-actions';
import { Separator } from '@/components/ui/separator';
import { withCoreClient } from '@/hoc';
import { useTheme, useTranslator } from '@/hooks';
import { cn } from '@/lib/theme-utils';
import type { OrgDetailsProps } from '@/types';

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
function OrgDetailsComponent({
  organization = {},
  isLoading = false,
  schema,
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
      color: mergeFieldConfig('color', t('sections.branding.fields.primary_color.error')),
      logoURL: mergeFieldConfig('logoURL', t('sections.branding.fields.logo.error')),
    });
  }, [t, schema]);

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
        const success = await formActions.nextAction.onClick({
          ...values,
          ...(organization?.id && { id: organization.id }),
        });

        if (success) {
          form.reset(values, {
            keepValues: true,
            keepDirty: false,
            keepTouched: false,
          });
        }
      }
    },
    [formActions?.nextAction, organization, form],
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
                  className: formActions.nextAction?.className,
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
