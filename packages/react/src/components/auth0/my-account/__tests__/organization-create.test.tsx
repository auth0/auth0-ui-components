import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationCreate } from '@/components/auth0/my-account/organization-create';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

describe('OrganizationCreate', () => {
  let createOrganization: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    createOrganization = mockCoreClient.getMyAccountApiClient().organizations.create as ReturnType<
      typeof vi.fn
    >;
    createOrganization.mockResolvedValue({ id: 'org_123', name: 'bulba_leaf' });
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  const getNameInput = () => screen.getByLabelText('sections.settings.fields.name.label');
  const getSubmit = () => screen.getByRole('button', { name: 'details.submit_button_label' });

  describe('when it renders', () => {
    it('shows the create title, empty fields, and a disabled create button', async () => {
      renderWithProviders(<OrganizationCreate />);

      expect(await screen.findByText('header.title')).toBeInTheDocument();
      expect(getNameInput()).toHaveValue('');
      expect(getNameInput()).toHaveAttribute(
        'placeholder',
        'details.sections.settings.fields.name.placeholder',
      );
      expect(getSubmit()).toBeDisabled();
    });

    it('hides discard and third-party access', async () => {
      renderWithProviders(<OrganizationCreate />);

      await screen.findByText('header.title');
      expect(screen.queryByRole('button', { name: 'cancel_button_label' })).not.toBeInTheDocument();
      expect(
        screen.queryByText('sections.settings.fields.third_party_client_access.label'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when the user submits a valid name', () => {
    it('creates the organization and calls createAction.onAfter', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();
      renderWithProviders(<OrganizationCreate createAction={{ onAfter }} />);

      await user.type(getNameInput(), 'bulba_leaf');
      await user.type(
        screen.getByLabelText('sections.settings.fields.display_name.label'),
        'Bulba Leaf',
      );
      await user.click(getSubmit());

      await waitFor(() => expect(onAfter).toHaveBeenCalled());
      expect(createOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'bulba_leaf', display_name: 'Bulba Leaf' }),
      );
    });
  });

  describe('when the name starts with org_', () => {
    it('shows the name error and does not create', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationCreate />);

      await user.type(getNameInput(), 'org_acme');
      await user.type(screen.getByLabelText('sections.settings.fields.display_name.label'), 'Acme');
      await user.click(getSubmit());

      expect(await screen.findByText('sections.settings.fields.name.error')).toBeInTheDocument();
      expect(createOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when the name is longer than 50 characters', () => {
    it('shows the name error and does not create', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationCreate />);

      await user.type(getNameInput(), 'a'.repeat(51));
      await user.type(screen.getByLabelText('sections.settings.fields.display_name.label'), 'Acme');
      await user.click(getSubmit());

      // The shared schema helper's length message is not translated yet.
      expect(await screen.findByText('Maximum 50 characters allowed')).toBeInTheDocument();
      expect(createOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when the logo URL is not https', () => {
    it('shows the logo error and does not create', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationCreate />);

      await user.type(getNameInput(), 'bulba_leaf');
      await user.type(
        screen.getByLabelText('sections.settings.fields.display_name.label'),
        'Bulba',
      );
      await user.type(
        screen.getByLabelText('sections.branding.fields.logo.label'),
        'http://example.com/logo.png',
      );
      await user.click(getSubmit());

      expect(await screen.findByText('sections.branding.fields.logo.error')).toBeInTheDocument();
      expect(createOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when the logo URL is https', () => {
    it('sends it as the organization logo', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationCreate />);

      await user.type(getNameInput(), 'bulba_leaf');
      await user.type(
        screen.getByLabelText('sections.settings.fields.display_name.label'),
        'Bulba',
      );
      await user.type(
        screen.getByLabelText('sections.branding.fields.logo.label'),
        'https://example.com/logo.png',
      );
      await user.click(getSubmit());

      await waitFor(() => expect(createOrganization).toHaveBeenCalled());
      expect(createOrganization).toHaveBeenCalledWith(
        expect.objectContaining({
          branding: expect.objectContaining({ logo_url: 'https://example.com/logo.png' }),
        }),
      );
    });
  });

  describe('when custom messages are provided', () => {
    it('overrides the create button label', async () => {
      renderWithProviders(
        <OrganizationCreate customMessages={{ details: { submit_button_label: 'Add org' } }} />,
      );

      expect(await screen.findByRole('button', { name: 'Add org' })).toBeInTheDocument();
    });
  });

  describe('when a back button is provided', () => {
    it('calls its handler', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithProviders(<OrganizationCreate backButton={{ onClick }} />);

      await user.click(await screen.findByRole('button', { name: /header.back_button_text/ }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('when readOnly is true', () => {
    it('hides the create button', async () => {
      renderWithProviders(<OrganizationCreate readOnly />);

      await screen.findByText('header.title');
      expect(
        screen.queryByRole('button', { name: 'details.submit_button_label' }),
      ).not.toBeInTheDocument();
    });
  });
});
