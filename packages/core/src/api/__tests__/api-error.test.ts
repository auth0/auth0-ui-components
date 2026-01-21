import { describe, it, expect } from 'vitest';

import { getStatusCode, hasApiErrorBody, normalizeError } from '../api-error';

describe('api-error', () => {
  describe('hasApiErrorBody', () => {
    describe('valid body property', () => {
      it('should return true for object body with various properties', () => {
        const testCases = [
          { body: {} },
          { body: { detail: 'Error details' } },
          { body: { title: 'Error Title' } },
          { body: { status: 400 } },
          { body: { type: 'https://example.com/error-type' } },
          { body: { detail: 'msg', title: 'Title', status: 400, type: 'url' } },
        ];

        testCases.forEach((error) => {
          expect(hasApiErrorBody(error)).toBe(true);
        });
      });

      it('should return true for array body (arrays are objects in JS)', () => {
        expect(hasApiErrorBody({ body: ['error'] })).toBe(true);
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
        { value: {}, description: 'empty object (no body)' },
      ])('when value is $description', ({ value }) => {
        it('should return false', () => {
          expect(hasApiErrorBody(value)).toBe(false);
        });
      });

      describe.each([
        { body: null, description: 'null' },
        { body: undefined, description: 'undefined' },
        { body: 'string', description: 'string' },
        { body: 123, description: 'number' },
      ])('when body is $description', ({ body }) => {
        it('should return false', () => {
          expect(hasApiErrorBody({ body })).toBe(false);
        });
      });
    });
  });

  describe('normalizeError', () => {
    describe('errors with body property', () => {
      const errorWithBody = {
        body: {
          detail: 'Invalid request parameters',
          status: 400,
        },
      };

      it('should return Error with body.detail as message', () => {
        const result = normalizeError(errorWithBody);
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('Invalid request parameters');
      });

      describe('resolver option', () => {
        it('should use resolved message when resolver returns a value', () => {
          const error = {
            body: {
              detail: 'Original detail',
              status: 404,
            },
          };
          const resolver = (code: number) => (code === 404 ? 'Resource not found' : undefined);

          expect(normalizeError(error, { resolver }).message).toBe('Resource not found');
        });

        it('should fall back to body.detail when resolver returns undefined/null', () => {
          const error = {
            body: {
              detail: 'Original detail',
              status: 400,
            },
          };
          const resolver = () => undefined;

          expect(normalizeError(error, { resolver }).message).toBe('Original detail');
        });

        it('should not call resolver when status is missing or non-number', () => {
          let called = false;
          const resolver = () => {
            called = true;
            return 'Resolved';
          };

          normalizeError({ body: { detail: 'test' } }, { resolver });
          expect(called).toBe(false);

          normalizeError({ body: { detail: 'test', status: '400' } }, { resolver });
          expect(called).toBe(false);
        });

        it('should resolve different status codes correctly', () => {
          const resolver = (code: number) => {
            const messages: Record<number, string> = {
              400: 'Bad Request',
              401: 'Unauthorized',
              403: 'Forbidden',
              404: 'Not Found',
              500: 'Internal Server Error',
            };
            return messages[code];
          };

          expect(normalizeError({ body: { status: 401 } }, { resolver }).message).toBe(
            'Unauthorized',
          );
          expect(normalizeError({ body: { status: 403 } }, { resolver }).message).toBe('Forbidden');
          expect(normalizeError({ body: { status: 500 } }, { resolver }).message).toBe(
            'Internal Server Error',
          );
        });
      });

      it('should use fallbackMessage when body.detail is missing', () => {
        const error = { body: { status: 400 } };
        const result = normalizeError(error, { fallbackMessage: 'Custom fallback' });
        expect(result.message).toBe('Custom fallback');
      });

      it('should use "Unknown API error" when no detail or fallback provided', () => {
        const error = { body: { status: 400 } };
        const result = normalizeError(error);
        expect(result.message).toBe('Unknown API error');
      });
    });

    describe('unknown error types', () => {
      describe.each([
        { value: null, description: 'null' },
        { value: undefined, description: 'undefined' },
        { value: 123, description: 'number' },
        { value: true, description: 'boolean' },
        { value: [], description: 'array' },
        { value: {}, description: 'empty object' },
        { value: () => {}, description: 'function' },
      ])('when error is $description', ({ value }) => {
        it('should return Error with default message', () => {
          const result = normalizeError(value);
          expect(result).toBeInstanceOf(Error);
          expect(result.message).toBe('An unknown error occurred');
        });

        it('should use fallbackMessage when provided', () => {
          const result = normalizeError(value, { fallbackMessage: 'Custom fallback' });
          expect(result.message).toBe('Custom fallback');
        });
      });
    });

    describe('edge cases', () => {
      it('should handle error with body but no detail', () => {
        const error = { body: {} };
        expect(normalizeError(error).message).toBe('Unknown API error');
      });

      it('should handle error with body.detail but no status', () => {
        const error = { body: { detail: 'Error message' } };
        expect(normalizeError(error).message).toBe('Error message');
      });

      it('should handle various option combinations', () => {
        expect(normalizeError({}, {}).message).toBe('An unknown error occurred');
        expect(normalizeError({}, undefined).message).toBe('An unknown error occurred');
        expect(normalizeError({}, { resolver: () => 'r' }).message).toBe(
          'An unknown error occurred',
        );
      });
    });
  });

  describe('getStatusCode', () => {
    describe('status extraction priority', () => {
      it('should return status from direct property', () => {
        expect(getStatusCode({ status: 404 })).toBe(404);
      });

      it('should return statusCode when status is missing', () => {
        expect(getStatusCode({ statusCode: 500 })).toBe(500);
      });

      it('should return response.status when direct status is missing', () => {
        expect(getStatusCode({ response: { status: 403 } })).toBe(403);
      });

      it('should return body.status as lowest priority', () => {
        expect(getStatusCode({ body: { status: 422 } })).toBe(422);
      });

      it('should respect priority order: status > statusCode > response.status > body.status', () => {
        const error = {
          status: 400,
          statusCode: 401,
          response: { status: 403 },
          body: { status: 422 },
        };
        expect(getStatusCode(error)).toBe(400);

        expect(getStatusCode({ statusCode: 401, response: { status: 403 } })).toBe(401);
        expect(getStatusCode({ response: { status: 403 }, body: { status: 422 } })).toBe(403);
      });

      it('should skip undefined/null status and use next valid one', () => {
        expect(getStatusCode({ status: undefined, statusCode: 401 })).toBe(401);
        expect(
          getStatusCode({ status: null, statusCode: undefined, response: { status: 403 } }),
        ).toBe(403);
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
        { value: {}, description: 'empty object' },
      ])('when error is $description', ({ value }) => {
        it('should return undefined', () => {
          expect(getStatusCode(value)).toBeUndefined();
        });
      });

      it('should return undefined when status values are non-numbers', () => {
        expect(getStatusCode({ status: '404' })).toBeUndefined();
        expect(getStatusCode({ statusCode: '500' })).toBeUndefined();
        expect(getStatusCode({ response: { status: '403' } })).toBeUndefined();
        expect(getStatusCode({ body: { status: '422' } })).toBeUndefined();
      });

      it('should return undefined when nested objects are invalid', () => {
        expect(getStatusCode({ response: 'invalid' })).toBeUndefined();
        expect(getStatusCode({ body: 'invalid' })).toBeUndefined();
        expect(getStatusCode({ response: null })).toBeUndefined();
        expect(getStatusCode({ body: null })).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle edge case numeric values', () => {
        expect(getStatusCode({ status: 0 })).toBe(0);
        expect(getStatusCode({ status: -1 })).toBe(-1);
        expect(getStatusCode({ status: 3000 })).toBe(3000);
        expect(getStatusCode({ status: NaN })).toBe(NaN);
      });
    });
  });
});
