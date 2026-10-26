import {
  SsoProvisioningMappers,
  type IdpScimTokenConfig,
  type ProvisioningCreateTokenFormValues,
} from '@auth0/universal-components-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

import { ProvisioningCreateTokenForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-form';
import { Form } from '@/components/ui/form';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: createMockI18nService().translator('manage_tokens.create_modal.fields'),
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  }),
}));

function Harness({ config }: { config?: IdpScimTokenConfig }) {
  const rules = SsoProvisioningMappers.getCreateTokenFormRules(config);
  const form = useForm<ProvisioningCreateTokenFormValues>({
    defaultValues: SsoProvisioningMappers.getCreateTokenFormDefaults(rules),
  });
  return (
    <Form {...form}>
      <ProvisioningCreateTokenForm form={form} rules={rules} />
    </Form>
  );
}

const bounded = {
  scopes: ['get:users', 'post:users'],
  default_expiry: 432000,
  max_allowed_expiry: 864000,
} as IdpScimTokenConfig;

describe('ProvisioningCreateTokenForm', () => {
  it('shows a clear no-expiration box and the lifetime field by default', () => {
    render(<Harness />);

    expect(screen.getByRole('checkbox', { name: 'no_expiration.label' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('textbox', { name: 'token_lifetime.label' })).toHaveValue('');
    expect(screen.getByText('token_lifetime.helper_min')).toBeInTheDocument();
  });

  it('hides the lifetime field when no expiration is checked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('checkbox', { name: 'no_expiration.label' }));

    expect(screen.queryByRole('textbox', { name: 'token_lifetime.label' })).not.toBeInTheDocument();
  });

  it('pre-fills the profile default and shows default and max helpers', () => {
    render(<Harness config={bounded} />);

    expect(screen.getByRole('textbox', { name: 'token_lifetime.label' })).toHaveValue('432000');
    expect(screen.getByText('token_lifetime.helper_default')).toBeInTheDocument();
    expect(screen.getByText('token_lifetime.helper_max')).toBeInTheDocument();
    expect(screen.getByText('token_lifetime.suffix')).toBeInTheDocument();
  });

  it('shows the profile scopes, all checked and selectable', async () => {
    const user = userEvent.setup();
    render(<Harness config={bounded} />);

    const getUsers = screen.getByRole('checkbox', { name: 'get:users' });
    expect(getUsers).toHaveAttribute('aria-checked', 'true');
    expect(getUsers).not.toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'post:users' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.queryByRole('checkbox', { name: 'delete:users' })).not.toBeInTheDocument();

    await user.click(getUsers);

    expect(getUsers).toHaveAttribute('aria-checked', 'false');
  });

  it('shows all 5 scopes when the profile sets no scope list', () => {
    render(<Harness />);

    for (const scope of ['get:users', 'post:users', 'put:users', 'patch:users', 'delete:users']) {
      expect(screen.getByRole('checkbox', { name: scope })).toBeInTheDocument();
    }
    expect(screen.getByText('scopes.helper_text')).toBeInTheDocument();
  });
});
