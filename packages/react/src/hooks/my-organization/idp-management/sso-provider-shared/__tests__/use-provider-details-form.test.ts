import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useProviderDetailsForm } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-provider-details-form';
import { createMockDomain } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import type { ProviderDetailsDomainsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

const acme = createMockDomain({ id: 'd1', domain: 'acme.com', status: 'verified' });
const initech = createMockDomain({ id: 'd2', domain: 'initech.com', status: 'verified' });

const domainsField = (
  overrides: Partial<ProviderDetailsDomainsProps> = {},
): ProviderDetailsDomainsProps => ({
  mode: 'required',
  options: [acme, initech],
  isLoading: false,
  canList: true,
  ...overrides,
});

describe('useProviderDetailsForm', () => {
  describe('when the domains field is not offered', () => {
    it('should start with the name and display name only', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({ initialData: { name: 'okta', display_name: 'Okta' } }),
      );

      expect(result.current.form.getValues()).toEqual({ name: 'okta', display_name: 'Okta' });
      expect(result.current.isDomainsRequired).toBe(false);
      expect(result.current.domainNames).toEqual([]);
      expect(result.current.showNoVerifiedDomainsAlert).toBe(false);
    });

    it('should leave domains out of the data even if the form holds some', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({
          initialData: { name: 'okta', display_name: 'Okta', domains: ['acme.com'] },
        }),
      );

      act(() => {
        result.current.form.setValue('domains', ['acme.com']);
      });

      expect(result.current.getData()).not.toHaveProperty('domains');
    });
  });

  describe('when the domains field is offered', () => {
    it('should start with no domains selected', () => {
      const { result } = renderHook(() => useProviderDetailsForm({ domains: domainsField() }));

      expect(result.current.form.getValues('domains')).toEqual([]);
      expect(result.current.getData().domains).toEqual([]);
    });

    it('should start with the domains already chosen', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({
          initialData: { name: 'okta', display_name: 'Okta', domains: ['acme.com'] },
          domains: domainsField(),
        }),
      );

      expect(result.current.getData().domains).toEqual(['acme.com']);
    });

    it('should expose the names of the offered domains', () => {
      const { result } = renderHook(() => useProviderDetailsForm({ domains: domainsField() }));

      expect(result.current.domainNames).toEqual(['acme.com', 'initech.com']);
    });

    it('should add the domains value when the field appears after the form mounted', async () => {
      const { result, rerender } = renderHook(
        ({ domains }) => useProviderDetailsForm({ domains }),
        { initialProps: { domains: null as ProviderDetailsDomainsProps | null } },
      );
      expect(result.current.form.getValues('domains')).toBeUndefined();

      rerender({ domains: domainsField() });

      await waitFor(() => {
        expect(result.current.form.getValues('domains')).toEqual([]);
      });
    });
  });

  describe('when the mode is required', () => {
    it('should flag the field as required', () => {
      const { result } = renderHook(() => useProviderDetailsForm({ domains: domainsField() }));

      expect(result.current.isDomainsRequired).toBe(true);
    });

    it('should reject the form when no domain is selected', async () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({
          initialData: { name: 'okta', display_name: 'Okta' },
          domains: domainsField(),
        }),
      );

      let valid = true;
      await act(async () => {
        valid = await result.current.form.trigger();
      });

      expect(valid).toBe(false);
      expect(result.current.form.getFieldState('domains').error?.message).toBe(
        'fields.domains.error',
      );
    });

    it('should accept the form once a domain is selected', async () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({
          initialData: { name: 'okta', display_name: 'Okta', domains: ['acme.com'] },
          domains: domainsField(),
        }),
      );

      let valid = false;
      await act(async () => {
        valid = await result.current.form.trigger();
      });

      expect(valid).toBe(true);
    });
  });

  describe('when the mode is optional', () => {
    it('should not flag the field as required', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({ domains: domainsField({ mode: 'optional' }) }),
      );

      expect(result.current.isDomainsRequired).toBe(false);
    });

    it('should accept the form with no domain selected', async () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({
          initialData: { name: 'okta', display_name: 'Okta' },
          domains: domainsField({ mode: 'optional' }),
        }),
      );

      let valid = false;
      await act(async () => {
        valid = await result.current.form.trigger();
      });

      expect(valid).toBe(true);
    });
  });

  describe('when a selected domain is no longer offered', () => {
    it('should drop it from the selection', async () => {
      const { result, rerender } = renderHook(
        ({ domains }) =>
          useProviderDetailsForm({
            initialData: {
              name: 'okta',
              display_name: 'Okta',
              domains: ['acme.com', 'initech.com'],
            },
            domains,
          }),
        { initialProps: { domains: domainsField() } },
      );

      rerender({ domains: domainsField({ options: [initech] }) });

      await waitFor(() => {
        expect(result.current.form.getValues('domains')).toEqual(['initech.com']);
      });
    });

    it('should keep the selection while the domains are loading', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({
          initialData: { name: 'okta', display_name: 'Okta', domains: ['acme.com'] },
          domains: domainsField({ options: [], isLoading: true }),
        }),
      );

      expect(result.current.form.getValues('domains')).toEqual(['acme.com']);
    });
  });

  describe('showNoVerifiedDomainsAlert', () => {
    it('should be true when required, listable, loaded and nothing is available', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({ domains: domainsField({ options: [] }) }),
      );

      expect(result.current.showNoVerifiedDomainsAlert).toBe(true);
    });

    it('should be false while loading', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({ domains: domainsField({ options: [], isLoading: true }) }),
      );

      expect(result.current.showNoVerifiedDomainsAlert).toBe(false);
    });

    it('should be false without permission to list domains', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({ domains: domainsField({ options: [], canList: false }) }),
      );

      expect(result.current.showNoVerifiedDomainsAlert).toBe(false);
    });

    it('should be false when the mode is optional', () => {
      const { result } = renderHook(() =>
        useProviderDetailsForm({ domains: domainsField({ options: [], mode: 'optional' }) }),
      );

      expect(result.current.showNoVerifiedDomainsAlert).toBe(false);
    });

    it('should be false when domains are available', () => {
      const { result } = renderHook(() => useProviderDetailsForm({ domains: domainsField() }));

      expect(result.current.showNoVerifiedDomainsAlert).toBe(false);
    });
  });
});
