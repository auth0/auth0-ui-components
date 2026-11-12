import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SsoProviderTestResult } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-result';
import { renderWithProviders } from '@/tests/utils/test-provider';

const user = { email: 'bob@acme.corp', email_verified: true };

describe('SsoProviderTestResult', () => {
  describe('state', () => {
    describe('when success', () => {
      it('should render the title, description and user profile', () => {
        renderWithProviders(<SsoProviderTestResult state="success" user={user} />);

        expect(screen.getByText('success_title')).toBeInTheDocument();
        expect(screen.getByText('success_description')).toBeInTheDocument();
        expect(screen.getByText('"bob@acme.corp"')).toBeInTheDocument();
      });

      it('should render profile values as text, not markup', () => {
        const { container } = renderWithProviders(
          <SsoProviderTestResult state="success" user={{ name: '<img src=x onerror=alert(1)>' }} />,
        );

        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('"<img src=x onerror=alert(1)>"')).toBeInTheDocument();
      });
    });

    describe('when error from the provider', () => {
      it('should render the provider message and try again text', () => {
        renderWithProviders(
          <SsoProviderTestResult
            state="error"
            errorReason="provider"
            errorMessage="The SAML responder could not process the request."
          />,
        );

        expect(screen.getByRole('alert')).toHaveTextContent(
          'The SAML responder could not process the request.',
        );
        expect(screen.getByRole('alert')).toHaveTextContent('try_again_text');
      });

      it('should render the provider message as text, not markup', () => {
        const { container } = renderWithProviders(
          <SsoProviderTestResult state="error" errorReason="provider" errorMessage="<b>bad</b>" />,
        );

        expect(container.querySelector('b')).toBeNull();
        expect(screen.getByRole('alert')).toHaveTextContent('<b>bad</b>');
      });
    });

    describe('when error because the test expired', () => {
      it('should render the expired message', () => {
        renderWithProviders(<SsoProviderTestResult state="error" errorReason="expired" />);

        expect(screen.getByRole('alert')).toHaveTextContent('expired_error');
      });
    });

    describe('when error because permission is missing', () => {
      it('should render the forbidden message', () => {
        renderWithProviders(<SsoProviderTestResult state="error" errorReason="forbidden" />);

        expect(screen.getByRole('alert')).toHaveTextContent('error.forbidden');
        expect(screen.getByRole('alert')).not.toHaveTextContent('try_again_text');
      });
    });

    describe('when timeout', () => {
      it('should render the timeout message', () => {
        renderWithProviders(<SsoProviderTestResult state="timeout" />);

        expect(screen.getByRole('alert')).toHaveTextContent('timeout_error');
      });
    });
  });

  describe('copyable', () => {
    describe('when false', () => {
      it('should not render a copy button', () => {
        renderWithProviders(<SsoProviderTestResult state="success" user={user} />);

        expect(screen.queryByRole('button', { name: 'copy_button_label' })).not.toBeInTheDocument();
      });
    });

    describe('when true', () => {
      it('should copy the profile JSON', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        const userActions = userEvent.setup();
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText },
          configurable: true,
        });
        renderWithProviders(<SsoProviderTestResult state="success" user={user} copyable />);

        await userActions.click(screen.getByRole('button', { name: 'copy_button_label' }));

        await waitFor(() => expect(writeText).toHaveBeenCalledWith(JSON.stringify(user, null, 2)));
      });
    });
  });

  describe('actions', () => {
    it('should render the provided actions', () => {
      renderWithProviders(
        <SsoProviderTestResult state="timeout" actions={<button type="button">Done</button>} />,
      );

      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });
  });
});
