import { describe, it, expect } from 'vitest';

import { BusinessError, isBusinessError } from '../business-error';
import type { BusinessErrorData } from '../business-error';

describe('business-error', () => {
  describe('BusinessError', () => {
    describe('constructor', () => {
      it('should create BusinessError with correct properties', () => {
        const error = new BusinessError({ message: 'Something went wrong' });

        expect(error.message).toBe('Something went wrong');
        expect(error.name).toBe('BusinessError');
        expect(error.type).toBe('BusinessError');
        expect(error.stack).toBeDefined();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(BusinessError);
      });

      it('should handle various message formats', () => {
        const testCases = [
          { input: '', expected: '' },
          {
            input: 'Error: <script>alert("xss")</script>',
            expected: 'Error: <script>alert("xss")</script>',
          },
          { input: 'Error: 日本語 🚀 émojis', expected: 'Error: 日本語 🚀 émojis' },
          { input: 'Line 1\nLine 2', expected: 'Line 1\nLine 2' },
          { input: '  \t  whitespace  \t  ', expected: '  \t  whitespace  \t  ' },
        ];

        testCases.forEach(({ input, expected }) => {
          const error = new BusinessError({ message: input });
          expect(error.message).toBe(expected);
        });
      });

      it('should handle very long messages', () => {
        const longMessage = 'a'.repeat(10000);
        const error = new BusinessError({ message: longMessage });
        expect(error.message.length).toBe(10000);
      });
    });

    describe('inheritance', () => {
      it('should be catchable as Error and BusinessError', () => {
        try {
          throw new BusinessError({ message: 'Caught error' });
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e).toBeInstanceOf(BusinessError);
          expect((e as BusinessError).type).toBe('BusinessError');
        }
      });

      it('should have correct prototype chain', () => {
        const error = new BusinessError({ message: 'Test' });
        expect(Object.getPrototypeOf(error)).toBe(BusinessError.prototype);
        expect(Object.getPrototypeOf(BusinessError.prototype)).toBe(Error.prototype);
      });
    });
  });

  describe('isBusinessError', () => {
    describe('valid BusinessError values', () => {
      it('should return true for BusinessError instances', () => {
        expect(isBusinessError(new BusinessError({ message: 'Test' }))).toBe(true);
        expect(isBusinessError(new BusinessError({ message: '' }))).toBe(true);
        expect(isBusinessError(new BusinessError({ message: 'a'.repeat(10000) }))).toBe(true);
      });

      it('should return true for thrown and caught BusinessError', () => {
        try {
          throw new BusinessError({ message: 'Thrown' });
        } catch (e) {
          expect(isBusinessError(e)).toBe(true);
        }
      });

      it('should return true for duck-typed objects with type "BusinessError"', () => {
        const testCases = [
          { type: 'BusinessError' },
          { type: 'BusinessError', message: 'Duck typed' },
          { type: 'BusinessError', message: 'msg', code: 'ERR_001', details: {} },
        ];

        testCases.forEach((error) => {
          expect(isBusinessError(error)).toBe(true);
        });
      });
    });

    describe('invalid values', () => {
      describe.each([
        { value: null, description: 'null' },
        { value: undefined, description: 'undefined' },
        { value: '', description: 'empty string' },
        { value: 'error', description: 'string' },
        { value: 123, description: 'number' },
        { value: true, description: 'boolean' },
        { value: [], description: 'array' },
        { value: () => {}, description: 'function' },
        { value: Symbol('test'), description: 'symbol' },
        { value: BigInt(123), description: 'bigint' },
        { value: {}, description: 'empty object' },
      ])('when value is $description', ({ value }) => {
        it('should return false', () => {
          expect(isBusinessError(value)).toBe(false);
        });
      });

      it('should return false for standard Error types', () => {
        expect(isBusinessError(new Error('test'))).toBe(false);
        expect(isBusinessError(new TypeError('test'))).toBe(false);
        expect(isBusinessError(new RangeError('test'))).toBe(false);
        expect(isBusinessError(new SyntaxError('test'))).toBe(false);
      });

      it('should return false for invalid type property values', () => {
        const invalidTypes = [
          { type: 'OtherError' },
          { type: 'businesserror' }, // wrong case
          { type: 'BUSINESSERROR' }, // wrong case
          { type: null },
          { type: undefined },
          { type: 123 },
          { type: true },
          { type: {} },
          { type: [] },
        ];

        invalidTypes.forEach((error) => {
          expect(isBusinessError(error)).toBe(false);
        });
      });

      it('should return false for objects with name but not type', () => {
        expect(isBusinessError({ name: 'BusinessError', message: 'test' })).toBe(false);
        expect(isBusinessError({ name: 'ApiError', message: 'test', status: 500 })).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle various object creation patterns', () => {
        // Getter
        const withGetter = {
          get type() {
            return 'BusinessError';
          },
        };
        expect(isBusinessError(withGetter)).toBe(true);

        // Prototype chain
        const proto = { type: 'BusinessError' };
        const fromProto = Object.create(proto);
        expect(isBusinessError(fromProto)).toBe(true);

        // Frozen/sealed
        expect(isBusinessError(Object.freeze({ type: 'BusinessError' }))).toBe(true);
        expect(isBusinessError(Object.seal({ type: 'BusinessError' }))).toBe(true);

        // No prototype
        const noProto = Object.create(null);
        noProto.type = 'BusinessError';
        expect(isBusinessError(noProto)).toBe(true);
      });

      it('should handle BusinessError in collections', () => {
        const errors = [
          new BusinessError({ message: 'Error 1' }),
          new BusinessError({ message: 'Error 2' }),
        ];
        errors.forEach((e) => expect(isBusinessError(e)).toBe(true));

        const errorMap = {
          first: new BusinessError({ message: 'First' }),
          second: new BusinessError({ message: 'Second' }),
        };
        expect(isBusinessError(errorMap.first)).toBe(true);
        expect(isBusinessError(errorMap.second)).toBe(true);
      });
    });
  });

  describe('BusinessErrorData interface', () => {
    it('should accept valid BusinessErrorData', () => {
      const data: BusinessErrorData = { message: 'Valid' };
      const error = new BusinessError(data);
      expect(error.message).toBe('Valid');
    });
  });
});
