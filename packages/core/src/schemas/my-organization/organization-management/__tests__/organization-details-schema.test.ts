import { describe, it, expect } from 'vitest';

import {
  createOrganizationDetailSchema,
  organizationDetailSchema,
  type InternalOrganizationDetailsFormValues,
} from '../organization-details-schema';

describe('Organization Details Schema', () => {
  const validOrganizationDetails: InternalOrganizationDetailsFormValues = {
    name: 'my-test-components-organization',
    display_name: 'My Test Components Organization',
    branding: {
      logo_url: 'https://example.com/logo.png',
      colors: {
        primary: '#FF5733',
        page_background: '#FFFFFF',
      },
    },
  };

  describe('default schema', () => {
    describe('name field', () => {
      it('should accept valid organization name', () => {
        const result = organizationDetailSchema.safeParse(validOrganizationDetails);
        expect(result.success).toBe(true);
      });

      it('should reject empty name', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          name: '',
        });
        expect(result.success).toBe(false);
      });

      it('should reject missing name field', () => {
        const { name, ...withoutName } = validOrganizationDetails;
        const result = organizationDetailSchema.safeParse(withoutName);
        expect(result.success).toBe(false);
      });

      describe.each([
        { input: 'organization-name', shouldPass: true, description: 'kebab-case name' },
        { input: 'organization_name', shouldPass: true, description: 'snake_case name' },
        { input: 'OrganizationName', shouldPass: true, description: 'PascalCase name' },
        { input: 'organization123', shouldPass: true, description: 'name with numbers' },
        { input: 'a', shouldPass: true, description: 'single character name' },
        {
          input: 'very-long-organization-name-that-is-still-valid',
          shouldPass: true,
          description: 'long name',
        },
      ])('when name is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = organizationDetailSchema.safeParse({
            ...validOrganizationDetails,
            name: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });
    });

    describe('display_name field', () => {
      it('should accept valid display name', () => {
        const result = organizationDetailSchema.safeParse(validOrganizationDetails);
        expect(result.success).toBe(true);
      });

      it('should reject empty display_name when required', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          display_name: '',
        });
        expect(result.success).toBe(false);
      });

      describe.each([
        { input: 'My Organization', shouldPass: true, description: 'normal display name' },
        { input: 'Acme Corp.', shouldPass: true, description: 'name with period' },
        { input: "O'Brien Inc", shouldPass: true, description: 'name with apostrophe' },
        { input: 'Company & Co', shouldPass: true, description: 'name with ampersand' },
        { input: '日本語組織', shouldPass: true, description: 'unicode characters' },
        { input: '  Spaces Around  ', shouldPass: true, description: 'name with spaces' },
      ])('when display_name is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = organizationDetailSchema.safeParse({
            ...validOrganizationDetails,
            display_name: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });
    });

    describe('branding.logo_url field', () => {
      it('should accept valid https logo URL', () => {
        const result = organizationDetailSchema.safeParse(validOrganizationDetails);
        expect(result.success).toBe(true);
      });

      it('should accept valid http logo URL', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            logo_url: 'http://example.com/logo.png',
          },
        });
        expect(result.success).toBe(true);
      });

      it('should accept empty logo_url (optional field)', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            logo_url: '',
          },
        });
        expect(result.success).toBe(true);
      });

      it('should accept undefined logo_url (optional field)', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            logo_url: undefined,
          },
        });
        expect(result.success).toBe(true);
      });

      describe.each([
        {
          input: 'https://cdn.example.com/images/logo.png',
          shouldPass: true,
          description: 'CDN URL',
        },
        {
          input: 'https://example.com/logo.svg',
          shouldPass: true,
          description: 'SVG image',
        },
        {
          input: 'https://example.com/path/to/logo.jpg?v=123',
          shouldPass: true,
          description: 'URL with query params',
        },
        {
          input: 'ftp://example.com/logo.png',
          shouldPass: false,
          description: 'FTP protocol (invalid)',
        },
        {
          input: 'not-a-url',
          shouldPass: false,
          description: 'plain text (invalid)',
        },
        {
          input: 'example.com/logo.png',
          shouldPass: false,
          description: 'missing protocol (invalid)',
        },
      ])('when logo_url is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = organizationDetailSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              logo_url: input,
            },
          });
          expect(result.success).toBe(shouldPass);
        });
      });
    });

    describe('branding.colors.primary field', () => {
      describe.each([
        { input: '#FF5733', shouldPass: true, description: '6-digit hex (uppercase)' },
        { input: '#ff5733', shouldPass: true, description: '6-digit hex (lowercase)' },
        { input: '#FfA', shouldPass: true, description: '3-digit hex (mixed case)' },
        { input: '#123', shouldPass: true, description: '3-digit hex' },
        { input: '#000000', shouldPass: true, description: 'black' },
        { input: '#FFFFFF', shouldPass: true, description: 'white' },
        { input: 'FF5733', shouldPass: false, description: 'missing hash' },
        { input: '#FF573', shouldPass: false, description: '5-digit hex (invalid)' },
        { input: '#FF57334', shouldPass: false, description: '7-digit hex (invalid)' },
        { input: '#GGGGGG', shouldPass: false, description: 'invalid hex characters' },
        { input: 'red', shouldPass: false, description: 'color name (invalid)' },
        { input: 'rgb(255,0,0)', shouldPass: false, description: 'RGB format (invalid)' },
        { input: '', shouldPass: false, description: 'empty string' },
      ])('when primary color is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = organizationDetailSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              colors: {
                ...validOrganizationDetails.branding.colors,
                primary: input,
              },
            },
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should return correct error message for invalid primary color', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            colors: {
              ...validOrganizationDetails.branding.colors,
              primary: 'invalid',
            },
          },
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Invalid color format');
        }
      });
    });

    describe('branding.colors.page_background field', () => {
      describe.each([
        { input: '#FFFFFF', shouldPass: true, description: 'white background' },
        { input: '#000000', shouldPass: true, description: 'black background' },
        { input: '#f5f5f5', shouldPass: true, description: 'light gray' },
        { input: '#ABC', shouldPass: true, description: '3-digit hex' },
        { input: 'FFFFFF', shouldPass: false, description: 'missing hash' },
        { input: '#GGG', shouldPass: false, description: 'invalid hex characters' },
        { input: '', shouldPass: false, description: 'empty string' },
      ])('when page_background is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = organizationDetailSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              colors: {
                ...validOrganizationDetails.branding.colors,
                page_background: input,
              },
            },
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should return correct error message for invalid background color', () => {
        const result = organizationDetailSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            colors: {
              ...validOrganizationDetails.branding.colors,
              page_background: 'invalid',
            },
          },
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Invalid color format');
        }
      });
    });
  });

  describe('createOrganizationDetailSchema factory', () => {
    describe('with custom name options', () => {
      it('should use custom error message for name', () => {
        const customMessage = 'Organization name is required';
        const customSchema = createOrganizationDetailSchema({
          name: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          ...validOrganizationDetails,
          name: '',
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });

    describe('with custom displayName options', () => {
      it('should allow optional display_name when required is false', () => {
        const customSchema = createOrganizationDetailSchema({
          displayName: { required: false },
        });
        const result = customSchema.safeParse({
          ...validOrganizationDetails,
          display_name: '',
        });

        expect(result.success).toBe(true);
      });

      it('should use custom error message for display_name', () => {
        const customMessage = 'Display name is invalid';
        const customSchema = createOrganizationDetailSchema({
          displayName: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          ...validOrganizationDetails,
          display_name: '',
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });

      it('should enforce minLength constraint', () => {
        const customSchema = createOrganizationDetailSchema({
          displayName: { minLength: 5 },
        });

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            display_name: 'ABC',
          }).success,
        ).toBe(false);

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            display_name: 'ABCDE',
          }).success,
        ).toBe(true);
      });

      it('should enforce maxLength constraint', () => {
        const customSchema = createOrganizationDetailSchema({
          displayName: { maxLength: 10 },
        });

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            display_name: 'Short',
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            display_name: 'This is way too long',
          }).success,
        ).toBe(false);
      });

      it('should use custom regex for display_name', () => {
        const customSchema = createOrganizationDetailSchema({
          displayName: {
            regex: /^[A-Z][a-z]+$/,
            errorMessage: 'Must start with uppercase',
          },
        });

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            display_name: 'Valid',
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            display_name: 'invalid',
          }).success,
        ).toBe(false);
      });
    });

    describe('with custom primaryColor options', () => {
      it('should use custom regex for primary color', () => {
        // Only allow specific colors
        const customSchema = createOrganizationDetailSchema({
          primaryColor: {
            regex: /^#(FF0000|00FF00|0000FF)$/,
            errorMessage: 'Only red, green, or blue allowed',
          },
        });

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              colors: {
                ...validOrganizationDetails.branding.colors,
                primary: '#FF0000',
              },
            },
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              colors: {
                ...validOrganizationDetails.branding.colors,
                primary: '#FFFF00',
              },
            },
          }).success,
        ).toBe(false);
      });

      it('should use custom error message for primary color', () => {
        const customMessage = 'Primary color must be a valid hex code';
        const customSchema = createOrganizationDetailSchema({
          primaryColor: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            colors: {
              ...validOrganizationDetails.branding.colors,
              primary: 'invalid',
            },
          },
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });

    describe('with custom backgroundColor options', () => {
      it('should use custom regex for background color', () => {
        // Only allow white or light colors
        const customSchema = createOrganizationDetailSchema({
          backgroundColor: {
            regex: /^#[Ff]{6}$/,
            errorMessage: 'Only white allowed',
          },
        });

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              colors: {
                ...validOrganizationDetails.branding.colors,
                page_background: '#FFFFFF',
              },
            },
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              colors: {
                ...validOrganizationDetails.branding.colors,
                page_background: '#000000',
              },
            },
          }).success,
        ).toBe(false);
      });

      it('should use custom error message for background color', () => {
        const customMessage = 'Background must be white';
        const customSchema = createOrganizationDetailSchema({
          backgroundColor: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            colors: {
              ...validOrganizationDetails.branding.colors,
              page_background: 'invalid',
            },
          },
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });

    describe('with custom logoURL options', () => {
      it('should use custom regex for logo URL', () => {
        // Only allow .png files
        const customSchema = createOrganizationDetailSchema({
          logoURL: {
            regex: /^https:\/\/.+\.png$/,
            errorMessage: 'Only PNG images allowed',
          },
        });

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              logo_url: 'https://example.com/logo.png',
            },
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            ...validOrganizationDetails,
            branding: {
              ...validOrganizationDetails.branding,
              logo_url: 'https://example.com/logo.jpg',
            },
          }).success,
        ).toBe(false);
      });

      it('should use custom error message for logo URL', () => {
        const customMessage = 'Logo must be a valid image URL';
        const customSchema = createOrganizationDetailSchema({
          logoURL: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          ...validOrganizationDetails,
          branding: {
            ...validOrganizationDetails.branding,
            logo_url: 'invalid-url',
          },
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });

    describe('with empty options', () => {
      it('should behave like the default schema', () => {
        const schemaWithEmptyOptions = createOrganizationDetailSchema({});

        expect(schemaWithEmptyOptions.safeParse(validOrganizationDetails).success).toBe(true);
        expect(
          schemaWithEmptyOptions.safeParse({
            ...validOrganizationDetails,
            name: '',
          }).success,
        ).toBe(false);
      });
    });

    describe('with undefined options', () => {
      it('should behave like the default schema', () => {
        const schemaWithUndefinedOptions = createOrganizationDetailSchema(undefined);

        expect(schemaWithUndefinedOptions.safeParse(validOrganizationDetails).success).toBe(true);
      });
    });

    describe('with multiple custom options', () => {
      it('should apply all custom options correctly', () => {
        const customSchema = createOrganizationDetailSchema({
          name: { errorMessage: 'Custom name error' },
          displayName: { minLength: 3, maxLength: 50 },
          primaryColor: { errorMessage: 'Custom primary error' },
          backgroundColor: { errorMessage: 'Custom background error' },
          logoURL: { errorMessage: 'Custom logo error' },
        });

        expect(customSchema.safeParse(validOrganizationDetails).success).toBe(true);
      });
    });
  });

  describe('type inference', () => {
    it('should correctly infer the form values type', () => {
      const validData: InternalOrganizationDetailsFormValues = {
        name: 'test-organization',
        display_name: 'Test Organization',
        branding: {
          logo_url: 'https://example.com/logo.png',
          colors: {
            primary: '#FF5733',
            page_background: '#FFFFFF',
          },
        },
      };
      const result = organizationDetailSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('test-organization');
        expect(result.data.display_name).toBe('Test Organization');
        expect(result.data.branding.colors.primary).toBe('#FF5733');
      }
    });
  });

  describe('edge cases', () => {
    it('should reject missing branding object', () => {
      const { branding, ...withoutBranding } = validOrganizationDetails;
      const result = organizationDetailSchema.safeParse(withoutBranding);
      expect(result.success).toBe(false);
    });

    it('should reject missing colors object', () => {
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        branding: {
          logo_url: 'https://example.com/logo.png',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing primary color', () => {
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        branding: {
          ...validOrganizationDetails.branding,
          colors: {
            page_background: '#FFFFFF',
          },
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing page_background color', () => {
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        branding: {
          ...validOrganizationDetails.branding,
          colors: {
            primary: '#FF5733',
          },
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        name: null,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-string name', () => {
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        name: 12345,
      });
      expect(result.success).toBe(false);
    });

    it('should handle special characters in name', () => {
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        name: 'organization-name_123',
      });
      expect(result.success).toBe(true);
    });

    it('should handle very long URLs', () => {
      const longUrl = `https://example.com/${'path/'.repeat(100)}logo.png`;
      const result = organizationDetailSchema.safeParse({
        ...validOrganizationDetails,
        branding: {
          ...validOrganizationDetails.branding,
          logo_url: longUrl,
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
