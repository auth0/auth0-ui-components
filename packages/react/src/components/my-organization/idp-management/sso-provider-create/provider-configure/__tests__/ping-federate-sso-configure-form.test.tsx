import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../../../../internals';
import { createMockI18nService } from '../../../../../../internals/__mocks__/core/i18n-service.mocks';
import type { PingFederateConfigureFormHandle } from '../ping-federate-sso-configure-form';
import { PingFederateProviderForm } from '../ping-federate-sso-configure-form';

describe('PingFederateProviderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createMockI18nService().translator('idp_management.create_sso_provider.provider_configure');
  });

  it('should render advanced settings fields when sign request is enabled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PingFederateProviderForm idpConfig={null} />);

    expect(
      screen.queryByText('fields.ping-federate.advanced_settings.sign_request_algorithm.label'),
    ).not.toBeInTheDocument();

    const accordionTrigger = screen.getByRole('button', {
      name: 'fields.ping-federate.advanced_settings.title',
    });
    await user.click(accordionTrigger);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(
      screen.getByText('fields.ping-federate.advanced_settings.sign_request_algorithm.label'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'fields.ping-federate.advanced_settings.sign_request_algorithm_digest.label',
      ),
    ).toBeInTheDocument();
  });

  it('should store uploaded certificate content and mark form dirty', async () => {
    const formRef = React.createRef<PingFederateConfigureFormHandle>();
    const onFormDirty = vi.fn();
    const originalText = File.prototype.text;
    const mockText = vi.fn().mockResolvedValueOnce('CERT_DATA');
    Object.defineProperty(File.prototype, 'text', {
      value: mockText,
      configurable: true,
    });

    const { container } = renderWithProviders(
      <PingFederateProviderForm ref={formRef} idpConfig={null} onFormDirty={onFormDirty} />,
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['CERT_DATA'], 'cert.pem', { type: 'application/x-pem-file' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(formRef.current?.getData().signingCert).toBe('CERT_DATA');
    });

    await waitFor(() => {
      expect(onFormDirty).toHaveBeenLastCalledWith(true);
    });

    if (originalText) {
      Object.defineProperty(File.prototype, 'text', {
        value: originalText,
        configurable: true,
      });
    } else {
      delete (File.prototype as { text?: unknown }).text;
    }
  });

  it('should show an error when an invalid certificate file is uploaded', async () => {
    const { container } = renderWithProviders(<PingFederateProviderForm idpConfig={null} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['INVALID'], 'cert.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('fields.ping-federate.sign_cert.error')).toBeInTheDocument();
    });
  });

  it('should log an error when file reading fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalText = File.prototype.text;
    const mockText = vi.fn().mockRejectedValueOnce(new Error('read error'));
    Object.defineProperty(File.prototype, 'text', {
      value: mockText,
      configurable: true,
    });

    const { container } = renderWithProviders(<PingFederateProviderForm idpConfig={null} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['CERT_DATA'], 'cert.pem', { type: 'application/x-pem-file' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
    if (originalText) {
      Object.defineProperty(File.prototype, 'text', {
        value: originalText,
        configurable: true,
      });
    } else {
      delete (File.prototype as { text?: unknown }).text;
    }
  });
});
