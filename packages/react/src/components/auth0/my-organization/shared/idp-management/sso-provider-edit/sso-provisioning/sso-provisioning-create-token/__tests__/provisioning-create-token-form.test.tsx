import {
  SsoProvisioningMappers,
  type IdpScimTokenConfig,
  type ProvisioningCreateTokenFormValues,
} from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

import { ProvisioningCreateTokenForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-form';
import { Form } from '@/components/ui/form';
import { renderWithProviders } from '@/tests/utils/test-provider';

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
  it('checks no expiration and hides the lifetime field by default', () => {
    renderWithProviders(<Harness />);

    expect(screen.getByRole('checkbox', { name: 'no_expiration.label' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.queryByRole('textbox', { name: 'token_lifetime.label' })).not.toBeInTheDocument();
  });

  it('offers no expiration only when the profile has no max_allowed_expiry', () => {
    const { unmount } = renderWithProviders(
      <Harness config={{ ...bounded, max_allowed_expiry: undefined }} />,
    );
    expect(screen.getByRole('checkbox', { name: 'no_expiration.label' })).toBeInTheDocument();
    unmount();

    renderWithProviders(<Harness config={bounded} />);
    expect(screen.queryByRole('checkbox', { name: 'no_expiration.label' })).not.toBeInTheDocument();
  });

  it('shows the lifetime field and helpers when no expiration is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('checkbox', { name: 'no_expiration.label' }));

    expect(screen.getByRole('textbox', { name: 'token_lifetime.label' })).toHaveValue('');
    expect(screen.getByText('token_lifetime.helper_min')).toBeInTheDocument();
  });

  it('pre-fills the profile default and shows default and max helpers', () => {
    renderWithProviders(<Harness config={bounded} />);

    expect(screen.getByRole('textbox', { name: 'token_lifetime.label' })).toHaveValue('432000');
    expect(screen.getByText('token_lifetime.helper_default')).toBeInTheDocument();
    expect(screen.getByText('token_lifetime.helper_max')).toBeInTheDocument();
    expect(screen.getByText('token_lifetime.suffix')).toBeInTheDocument();
  });

  it('shows the profile scopes, all checked and selectable', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness config={bounded} />);

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
    renderWithProviders(<Harness />);

    for (const scope of ['get:users', 'post:users', 'put:users', 'patch:users', 'delete:users']) {
      expect(screen.getByRole('checkbox', { name: scope })).toBeInTheDocument();
    }
    expect(screen.getByText('scopes.helper_text')).toBeInTheDocument();
  });
});
