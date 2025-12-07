import { describe, it, expect } from 'vitest';

import {
  createDeleteProviderSchema,
  deleteProviderSchema,
  type DeleteProviderFormValues,
} from '../sso-provider-delete-schema';

describe('SSO Provider Delete Schema', () => {
  const expectedProviderName = 'my-sso-provider';

  describe('deleteProviderSchema', () => {
    describe('providerName field', () => {
      describe.each([
        {
          input: 'my-sso-provider',
          expected: 'my-sso-provider',
          shouldPass: true,
          description: 'exact match',
        },
        {
          input: 'wrong-provider-name',
          expected: 'my-sso-provider',
          shouldPass: false,
          description: 'mismatched name',
        },
        {
          input: 'my-sso-Provider',
          expected: 'my-sso-provider',
          shouldPass: false,
          description: 'case mismatch',
        },
        {
          input: ' my-sso-provider',
          expected: 'my-sso-provider',
          shouldPass: false,
          description: 'leading space',
        },
        {
          input: 'my-sso-provider ',
          expected: 'my-sso-provider',
          shouldPass: false,
          description: 'trailing space',
        },
        {
          input: '',
          expected: 'my-sso-provider',
          shouldPass: false,
          description: 'empty string',
        },
      ])(
        'when input is "$input" and expected is "$expected" ($description)',
        ({ input, expected, shouldPass }) => {
          it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
            const schema = deleteProviderSchema(expected);
            const result = schema.safeParse({ providerName: input });
            expect(result.success).toBe(shouldPass);
          });
        },
      );

      it('should reject missing providerName', () => {
        const schema = deleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
      });

      it('should reject null providerName', () => {
        const schema = deleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({ providerName: null });
        expect(result.success).toBe(false);
      });

      it('should reject undefined providerName', () => {
        const schema = deleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({ providerName: undefined });
        expect(result.success).toBe(false);
      });

      it('should return default error message for missing providerName', () => {
        const schema = deleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Provider name is required');
        }
      });

      it('should return confirmation error message for mismatched name', () => {
        const schema = deleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({ providerName: 'wrong-name' });
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(
            `Please enter "${expectedProviderName}" to confirm deletion`,
          );
        }
      });
    });

    describe('with different expected provider names', () => {
      describe.each([
        { expected: 'okta-enterprise', input: 'okta-enterprise' },
        { expected: 'google-workspace-sso', input: 'google-workspace-sso' },
        { expected: 'azure-ad-connection', input: 'azure-ad-connection' },
        { expected: 'Provider With Spaces', input: 'Provider With Spaces' },
        { expected: 'UPPERCASE-PROVIDER', input: 'UPPERCASE-PROVIDER' },
        { expected: 'provider_with_underscores', input: 'provider_with_underscores' },
        { expected: 'provider.with.dots', input: 'provider.with.dots' },
        { expected: '123-numeric-start', input: '123-numeric-start' },
      ])('when expected is "$expected"', ({ expected, input }) => {
        it('should accept exact match', () => {
          const schema = deleteProviderSchema(expected);
          const result = schema.safeParse({ providerName: input });
          expect(result.success).toBe(true);
        });

        it('should reject different input', () => {
          const schema = deleteProviderSchema(expected);
          const result = schema.safeParse({ providerName: 'completely-different-name' });
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('createDeleteProviderSchema factory', () => {
    describe('with default options', () => {
      it('should create schema with default error messages', () => {
        const schema = createDeleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Provider name is required');
        }
      });

      it('should validate exact match with default options', () => {
        const schema = createDeleteProviderSchema(expectedProviderName);
        const result = schema.safeParse({ providerName: expectedProviderName });
        expect(result.success).toBe(true);
      });
    });

    describe('with custom errorMessage option', () => {
      it('should use custom error message for missing providerName', () => {
        const customMessage = 'Please enter the provider name to continue';
        const schema = createDeleteProviderSchema(expectedProviderName, {
          providerName: { errorMessage: customMessage },
        });
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });

      it('should still validate exact match with custom error message', () => {
        const schema = createDeleteProviderSchema(expectedProviderName, {
          providerName: { errorMessage: 'Custom error' },
        });
        const result = schema.safeParse({ providerName: expectedProviderName });
        expect(result.success).toBe(true);
      });
    });

    describe('with exactMatch option', () => {
      const customExactMatch = 'custom-confirmation-text';

      it('should validate against exactMatch instead of expectedProviderName', () => {
        const schema = createDeleteProviderSchema(expectedProviderName, {
          providerName: { exactMatch: customExactMatch },
        });
        const result = schema.safeParse({ providerName: customExactMatch });
        expect(result.success).toBe(true);
      });

      it('should reject original expectedProviderName when exactMatch is set', () => {
        const schema = createDeleteProviderSchema(expectedProviderName, {
          providerName: { exactMatch: customExactMatch },
        });
        const result = schema.safeParse({ providerName: expectedProviderName });
        expect(result.success).toBe(false);
      });

      it('should show exactMatch in error message', () => {
        const schema = createDeleteProviderSchema(expectedProviderName, {
          providerName: { exactMatch: customExactMatch },
        });
        const result = schema.safeParse({ providerName: 'wrong-input' });
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(
            `Please enter "${customExactMatch}" to confirm deletion`,
          );
        }
      });

      describe.each([
        { exactMatch: 'DELETE', description: 'uppercase word' },
        { exactMatch: 'confirm-delete', description: 'kebab-case phrase' },
        { exactMatch: 'Type this to confirm', description: 'sentence with spaces' },
        { exactMatch: '12345', description: 'numeric string' },
      ])('with exactMatch "$exactMatch" ($description)', ({ exactMatch }) => {
        it('should accept exact match', () => {
          const schema = createDeleteProviderSchema(expectedProviderName, {
            providerName: { exactMatch },
          });
          const result = schema.safeParse({ providerName: exactMatch });
          expect(result.success).toBe(true);
        });

        it('should reject non-matching input', () => {
          const schema = createDeleteProviderSchema(expectedProviderName, {
            providerName: { exactMatch },
          });
          const result = schema.safeParse({ providerName: 'wrong' });
          expect(result.success).toBe(false);
        });
      });
    });

    describe('with combined options', () => {
      it('should use both custom error message and exactMatch', () => {
        const customMessage = 'Provider name confirmation is required';
        const customExactMatch = 'CONFIRM';
        const schema = createDeleteProviderSchema(expectedProviderName, {
          providerName: {
            errorMessage: customMessage,
            exactMatch: customExactMatch,
          },
        });

        // Test custom required error
        const missingResult = schema.safeParse({});
        expect(missingResult.success).toBe(false);
        if (!missingResult.success && missingResult.error?.errors[0]) {
          expect(missingResult.error.errors[0].message).toBe(customMessage);
        }

        // Test exactMatch validation
        const matchResult = schema.safeParse({ providerName: customExactMatch });
        expect(matchResult.success).toBe(true);

        // Test exactMatch error message
        const wrongResult = schema.safeParse({ providerName: 'wrong' });
        expect(wrongResult.success).toBe(false);
        if (!wrongResult.success && wrongResult.error?.errors[0]) {
          expect(wrongResult.error.errors[0].message).toBe(
            `Please enter "${customExactMatch}" to confirm deletion`,
          );
        }
      });
    });

    describe('with empty options object', () => {
      it('should behave same as default', () => {
        const schemaWithEmptyOptions = createDeleteProviderSchema(expectedProviderName, {});
        const defaultSchema = deleteProviderSchema(expectedProviderName);

        const input = { providerName: expectedProviderName };
        expect(schemaWithEmptyOptions.safeParse(input).success).toBe(
          defaultSchema.safeParse(input).success,
        );
      });

      it('should use default error messages with empty providerName options', () => {
        const schema = createDeleteProviderSchema(expectedProviderName, { providerName: {} });
        const result = schema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Provider name is required');
        }
      });
    });
  });

  describe('Type inference', () => {
    it('should correctly infer DeleteProviderFormValues type', () => {
      const validData: DeleteProviderFormValues = {
        providerName: 'test-provider',
      };
      const schema = deleteProviderSchema('test-provider');
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should strip extra fields from parsed data', () => {
      const dataWithExtraFields = {
        providerName: expectedProviderName,
        extraField: 'should be stripped',
        anotherExtra: 123,
      };
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse(dataWithExtraFields);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ providerName: expectedProviderName });
        expect((result.data as Record<string, unknown>).extraField).toBeUndefined();
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty expected provider name', () => {
      const schema = deleteProviderSchema('');
      const result = schema.safeParse({ providerName: '' });
      expect(result.success).toBe(true);
    });

    it('should handle special characters in provider name', () => {
      const specialName = 'provider-with-$pecial_chars!@#';
      const schema = deleteProviderSchema(specialName);
      const result = schema.safeParse({ providerName: specialName });
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters in provider name', () => {
      const unicodeName = 'プロバイダー-日本語';
      const schema = deleteProviderSchema(unicodeName);
      const result = schema.safeParse({ providerName: unicodeName });
      expect(result.success).toBe(true);
    });

    it('should handle very long provider name', () => {
      const longName = 'a'.repeat(1000);
      const schema = deleteProviderSchema(longName);
      const result = schema.safeParse({ providerName: longName });
      expect(result.success).toBe(true);
    });

    it('should handle provider name with only whitespace as input', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: '   ' });
      expect(result.success).toBe(false);
    });

    it('should handle newlines in input', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: `${expectedProviderName}\n` });
      expect(result.success).toBe(false);
    });

    it('should handle tabs in input', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: `\t${expectedProviderName}` });
      expect(result.success).toBe(false);
    });

    it('should be case-sensitive', () => {
      const schema = deleteProviderSchema('MyProvider');
      expect(schema.safeParse({ providerName: 'MyProvider' }).success).toBe(true);
      expect(schema.safeParse({ providerName: 'myprovider' }).success).toBe(false);
      expect(schema.safeParse({ providerName: 'MYPROVIDER' }).success).toBe(false);
      expect(schema.safeParse({ providerName: 'myProvider' }).success).toBe(false);
    });

    it('should reject number input type', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: 12345 });
      expect(result.success).toBe(false);
    });

    it('should reject boolean input type', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: true });
      expect(result.success).toBe(false);
    });

    it('should reject array input type', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: [expectedProviderName] });
      expect(result.success).toBe(false);
    });

    it('should reject object input type', () => {
      const schema = deleteProviderSchema(expectedProviderName);
      const result = schema.safeParse({ providerName: { name: expectedProviderName } });
      expect(result.success).toBe(false);
    });
  });
});
