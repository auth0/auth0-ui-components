import { describe, it, expect } from 'vitest';

import { DEFAULT_COLORS } from '../organization-details-constants';
import { OrganizationDetailsMappers } from '../organization-details-mappers';
import type {
  GetOrganizationDetailsResponseContent,
  OrganizationPrivate,
} from '../organization-details-types';

describe('OrganizationDetailsMappers', () => {
  describe('fromAPI', () => {
    it('should map complete API response correctly', () => {
      const apiResponse: GetOrganizationDetailsResponseContent = {
        id: 'organization_123',
        name: 'test-organization',
        display_name: 'Test Organizationanization',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: {
            primary: '#ff0000',
            page_background: '#ffffff',
          },
        },
      };

      const result = OrganizationDetailsMappers.fromAPI(apiResponse);

      expect(result).toEqual({
        id: 'organization_123',
        name: 'test-organization',
        display_name: 'Test Organizationanization',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: {
            primary: '#ff0000',
            page_background: '#ffffff',
          },
        },
      });
    });

    describe('default values', () => {
      describe.each([
        { field: 'id', expected: '' },
        { field: 'name', expected: '' },
        { field: 'display_name', expected: '' },
      ])('when $field is missing', ({ field, expected }) => {
        it(`should default ${field} to "${expected}"`, () => {
          const apiResponse = {
            id: 'organization_123',
            name: 'test-organization',
            display_name: 'Test Organization',
          } as GetOrganizationDetailsResponseContent;
          delete (apiResponse as Record<string, unknown>)[field];

          const result = OrganizationDetailsMappers.fromAPI(apiResponse);

          expect(result[field as keyof typeof result]).toBe(expected);
        });
      });

      it('should use default branding when branding is missing', () => {
        const apiResponse = {
          id: 'organization_123',
          name: 'test-organization',
          display_name: 'Test Organization',
        } as GetOrganizationDetailsResponseContent;

        const result = OrganizationDetailsMappers.fromAPI(apiResponse);

        expect(result.branding).toEqual({
          logo_url: '',
          colors: {
            primary: DEFAULT_COLORS.UL_PRIMARY,
            page_background: DEFAULT_COLORS.UL_PAGE_BG,
          },
        });
      });

      it('should use default colors when colors object is missing', () => {
        const apiResponse = {
          id: 'organization_123',
          name: 'test-organization',
          display_name: 'Test Organization',
          branding: { logo_url: '' },
        } as GetOrganizationDetailsResponseContent;

        const result = OrganizationDetailsMappers.fromAPI(apiResponse);

        expect(result.branding.colors.primary).toBe(DEFAULT_COLORS.UL_PRIMARY);
        expect(result.branding.colors.page_background).toBe(DEFAULT_COLORS.UL_PAGE_BG);
      });

      describe.each([
        { color: 'primary', defaultValue: DEFAULT_COLORS.UL_PRIMARY },
        { color: 'page_background', defaultValue: DEFAULT_COLORS.UL_PAGE_BG },
      ])('when $color color is missing or empty', ({ color, defaultValue }) => {
        it(`should use default ${color} when missing`, () => {
          const colors = { primary: '#ff0000', page_background: '#ffffff' };
          delete (colors as Record<string, unknown>)[color];

          const apiResponse = {
            id: 'organization_123',
            name: 'test-organization',
            display_name: 'Test Organization',
            branding: { logo_url: '', colors },
          } as GetOrganizationDetailsResponseContent;

          const result = OrganizationDetailsMappers.fromAPI(apiResponse);

          expect(result.branding.colors[color as keyof typeof result.branding.colors]).toBe(
            defaultValue,
          );
        });

        it(`should use default ${color} when empty string`, () => {
          const colors = { primary: '#ff0000', page_background: '#ffffff' };
          (colors as Record<string, unknown>)[color] = '';

          const apiResponse: GetOrganizationDetailsResponseContent = {
            id: 'organization_123',
            name: 'test-organization',
            display_name: 'Test Organization',
            branding: { logo_url: '', colors },
          };

          const result = OrganizationDetailsMappers.fromAPI(apiResponse);

          expect(result.branding.colors[color as keyof typeof result.branding.colors]).toBe(
            defaultValue,
          );
        });
      });
    });

    describe('edge cases', () => {
      it('should handle special characters and unicode in display_name', () => {
        const apiResponse: GetOrganizationDetailsResponseContent = {
          id: 'organization_123',
          name: 'test-organization',
          display_name: 'Test Organization™ © 日本語 🚀',
          branding: {
            logo_url: '',
            colors: { primary: '#000', page_background: '#fff' },
          },
        };

        const result = OrganizationDetailsMappers.fromAPI(apiResponse);

        expect(result.display_name).toBe('Test Organization™ © 日本語 🚀');
      });

      it('should handle various hex color formats', () => {
        const apiResponse: GetOrganizationDetailsResponseContent = {
          id: 'organization_123',
          name: 'test-organization',
          display_name: 'Test Organization',
          branding: {
            logo_url: '',
            colors: { primary: '#F00', page_background: '#FFFFFF' },
          },
        };

        const result = OrganizationDetailsMappers.fromAPI(apiResponse);

        expect(result.branding.colors.primary).toBe('#F00');
        expect(result.branding.colors.page_background).toBe('#FFFFFF');
      });
    });
  });

  describe('toAPI', () => {
    it('should map form values to API payload correctly with logo', () => {
      const formValues: OrganizationPrivate = {
        id: 'organization_123',
        name: 'test-organization',
        display_name: 'Test Organizationanization',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: { primary: '#ff0000', page_background: '#ffffff' },
        },
      };

      const result = OrganizationDetailsMappers.toAPI(formValues);

      expect(result).toEqual({
        name: 'test-organization',
        display_name: 'Test Organizationanization',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: { primary: '#ff0000', page_background: '#ffffff' },
        },
      });
    });

    it('should not include id in API payload', () => {
      const formValues: OrganizationPrivate = {
        id: 'organization_123',
        name: 'test-organization',
        display_name: 'Test',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: { primary: '#000', page_background: '#fff' },
        },
      };

      const result = OrganizationDetailsMappers.toAPI(formValues);

      expect(result).not.toHaveProperty('id');
    });

    describe('logo_url handling', () => {
      describe.each([
        { value: undefined, description: 'undefined' },
        { value: '', description: 'empty string' },
        { value: '   ', description: 'whitespace only' },
        { value: '  \t  ', description: 'tabs and spaces' },
      ])('when logo_url is $description', ({ value }) => {
        it('should not include logo_url in payload', () => {
          const formValues: OrganizationPrivate = {
            id: 'organization_123',
            name: 'test-organization',
            display_name: 'Test',
            branding: {
              logo_url: value as unknown as string,
              colors: { primary: '#000', page_background: '#fff' },
            },
          };

          const result = OrganizationDetailsMappers.toAPI(formValues);

          expect(result.branding).not.toHaveProperty('logo_url');
        });
      });

      it('should preserve logo_url with leading/trailing whitespace', () => {
        const formValues: OrganizationPrivate = {
          id: 'organization_123',
          name: 'test-organization',
          display_name: 'Test',
          branding: {
            logo_url: '  https://example.com/logo.png  ',
            colors: { primary: '#000', page_background: '#fff' },
          },
        };

        const result = OrganizationDetailsMappers.toAPI(formValues);

        expect(result.branding?.logo_url).toBe('  https://example.com/logo.png  ');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string values', () => {
        const formValues: OrganizationPrivate = {
          name: '',
          display_name: '',
          branding: {
            logo_url: '',
            colors: { primary: '#000', page_background: '#fff' },
          },
        };

        const result = OrganizationDetailsMappers.toAPI(formValues);

        expect(result.name).toBe('');
        expect(result.display_name).toBe('');
      });

      it('should handle special characters and unicode', () => {
        const formValues: OrganizationPrivate = {
          name: 'test-organization',
          display_name: 'Test Organization™ © 日本語 🚀',
          branding: {
            logo_url: '',
            colors: { primary: '#000', page_background: '#fff' },
          },
        };

        const result = OrganizationDetailsMappers.toAPI(formValues);

        expect(result.display_name).toBe('Test Organization™ © 日本語 🚀');
      });
    });
  });

  describe('roundtrip (fromAPI -> toAPI)', () => {
    it('should maintain data integrity with logo', () => {
      const original: GetOrganizationDetailsResponseContent = {
        id: 'organization_123',
        name: 'test-organization',
        display_name: 'Test Organizationanization',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: { primary: '#ff0000', page_background: '#ffffff' },
        },
      };

      const mapped = OrganizationDetailsMappers.fromAPI(original);
      const result = OrganizationDetailsMappers.toAPI(mapped);

      expect(result.name).toBe(original.name);
      expect(result.display_name).toBe(original.display_name);
      expect(result.branding?.logo_url).toBe(original.branding?.logo_url);
      expect(result.branding?.colors).toEqual(original.branding?.colors);
    });

    it('should apply defaults for missing colors', () => {
      const original = {
        id: 'organization_123',
        name: 'test-organization',
        display_name: 'Test Organizationanization',
      } as GetOrganizationDetailsResponseContent;

      const mapped = OrganizationDetailsMappers.fromAPI(original);
      const result = OrganizationDetailsMappers.toAPI(mapped);

      expect(result.branding?.colors?.primary).toBe(DEFAULT_COLORS.UL_PRIMARY);
      expect(result.branding?.colors?.page_background).toBe(DEFAULT_COLORS.UL_PAGE_BG);
    });
  });
});
