import type { MfaAuthenticator } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MfaWizard } from '@/components/auth0/shared/gate-keeper/mfa-step-up/mfa-wizard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  createMockCoreClient,
  createMockMfaApiClient,
} from '@/tests/utils/__mocks__/core/core-client.mocks';
import { mockMfaRequiredError } from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { MfaStepUpClasses } from '@/types/mfa-step-up-types';

const authenticator = (patch: Partial<MfaAuthenticator>): MfaAuthenticator => ({
  id: 'auth-1',
  authenticatorType: 'otp',
  active: true,
  ...patch,
});

const everyClass: MfaStepUpClasses = {
  'MfaStepUp-dialogContent': 'x-dialogContent',
  'MfaStepUp-header': 'x-header',
  'MfaStepUp-title': 'x-title',
  'MfaStepUp-description': 'x-description',
  'MfaStepUp-actions': 'x-actions',
  'MfaStepUp-primaryButton': 'x-primaryButton',
  'MfaStepUp-secondaryButton': 'x-secondaryButton',
  'MfaStepUp-link': 'x-link',
  'MfaStepUp-field': 'x-field',
  'MfaStepUp-methodGroup': 'x-methodGroup',
  'MfaStepUp-methodGroupTitle': 'x-methodGroupTitle',
  'MfaStepUp-card': 'x-card',
  'MfaStepUp-qrCode': 'x-qrCode',
  'MfaStepUp-storeCard': 'x-storeCard',
  'MfaStepUp-recoveryCode': 'x-recoveryCode',
  'MfaStepUp-statusIcon': 'x-statusIcon',
  'MfaStepUp-pushStatus': 'x-pushStatus',
  'MfaStepUp-message': 'x-message',
  'MfaStepUp-loading': 'x-loading',
};

describe('classes for the MFA step-up dialog', () => {
  let apiClient: ReturnType<typeof createMockMfaApiClient>;

  beforeEach(() => {
    apiClient = createMockMfaApiClient();
  });

  const renderWizard = (classes: MfaStepUpClasses = everyClass) =>
    renderWithProviders(
      <Dialog open>
        <DialogContent>
          <MfaWizard
            error={mockMfaRequiredError}
            onComplete={vi.fn()}
            onCancel={vi.fn()}
            classes={classes}
          />
        </DialogContent>
      </Dialog>,
      { coreClient: createMockCoreClient(undefined, apiClient) },
    );

  it('puts them on the list: header, title, description, groups, cards, buttons', async () => {
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([authenticator({})]);
    renderWizard();

    const title = await screen.findByText('mfa.verify_title');
    expect(title).toHaveClass('x-title');
    expect(title.parentElement).toHaveClass('x-header');
    expect(screen.getByText('mfa.choose_method')).toHaveClass('x-description');
    expect(screen.getByRole('heading', { name: 'mfa.method.otp' })).toHaveClass(
      'x-methodGroupTitle',
    );
    expect(screen.getByRole('heading', { name: 'mfa.method.otp' }).parentElement).toHaveClass(
      'x-methodGroup',
    );
    expect(screen.getByRole('radio')).toHaveClass('x-card');
    expect(screen.getByRole('button', { name: 'mfa.continue' })).toHaveClass('x-primaryButton');
    expect(screen.getByRole('button', { name: 'mfa.cancel' })).toHaveClass('x-secondaryButton');
    expect(screen.getByRole('button', { name: 'mfa.continue' }).parentElement).toHaveClass(
      'x-actions',
    );
  });

  it('puts them on the code form: the field', async () => {
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([authenticator({})]);
    const user = userEvent.setup();
    renderWizard();

    await user.click(await screen.findByRole('radio', { name: /mfa.method.otp/ }));
    await user.click(screen.getByRole('button', { name: 'mfa.continue' }));
    await user.click(await screen.findByRole('button', { name: 'mfa.confirm.verify_selected' }));

    expect((await screen.findAllByRole('textbox'))[0]!.closest('.x-field')).not.toBeNull();
  });

  it('puts them on the push screen: links and the status line', async () => {
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([
      authenticator({ authenticatorType: 'oob', type: 'push-notification' }),
    ]);
    const user = userEvent.setup();
    renderWizard();

    await user.click(await screen.findByRole('radio', { name: /mfa.method.push/ }));
    await user.click(screen.getByRole('button', { name: 'mfa.continue' }));
    await user.click(await screen.findByRole('button', { name: 'mfa.confirm.send_push' }));

    expect(await screen.findByText('mfa.challenge.push_resend')).toHaveClass('x-link');
    expect(screen.getByRole('status')).toHaveClass('x-pushStatus');
  });

  it('shows the loading state with its class', () => {
    vi.mocked(apiClient.getAuthenticators).mockReturnValue(new Promise(() => {}));
    renderWizard();

    expect(screen.getByRole('status')).toHaveClass('x-loading');
  });

  it('shows the message of an unavailable flow with its class', async () => {
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([]);
    renderWizard();

    expect(await screen.findByText('mfa.no_authenticators')).toHaveClass('x-message');
  });

  it('adds to the defaults instead of replacing them', async () => {
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([authenticator({})]);
    renderWizard();

    expect(await screen.findByRole('radio')).toHaveClass('rounded-xl', 'x-card');
  });

  it('works without any classes', async () => {
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([authenticator({})]);
    renderWizard({});

    expect(await screen.findByRole('radio')).toBeInTheDocument();
  });
});
