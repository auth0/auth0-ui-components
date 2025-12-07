import { describe, it, expect } from 'vitest';

import { getStatusCode, hasApiErrorBody, isApiError, normalizeError } from '../api-error';
import type { ApiError } from '../api-types';

describe('api-error', () => {
  describe('isApiError', () => {
    it('should return true for valid ApiError with all required fields', () => {
      const validApiError: ApiError = {
        name: 'ApiError',
        message: 'Something went wrong',
        status: 500,
      };
      expect(isApiError(validApiError)).toBe(true);
    });

    it('should return true for ApiError with optional data property', () => {
      const apiErrorWithData: ApiError = {
        name: 'ApiError',
        message: 'Bad request',
        status: 400,
        data: { error: 'invalid_request' },
      };
      expect(isApiError(apiErrorWithData)).toBe(true);
    });

    describe('invalid values', () => {
      describe.each([
        { value: null, description: 'null' },
        { value: undefined, description: 'undefined' },
        { value: '', description: 'empty string' },
        { value: 'error message', description: 'string' },
        { value: 123, description: 'number' },
        { value: true, description: 'boolean' },
        { value: [], description: 'array' },
        { value: () => {}, description: 'function' },
        { value: {}, description: 'empty object' },
        { value: new Error('test'), description: 'Error instance' },
      ])('when value is $description', ({ value }) => {
        it('should return false', () => {
          expect(isApiError(value)).toBe(false);
        });
      });

      describe.each([
        {
          error: { message: 'test', status: 500 },
          missing: 'name',
        },
        {
          error: { name: 'ApiError', status: 500 },
          missing: 'message',
        },
        {
          error: { name: 'ApiError', message: 'test' },
          missing: 'status',
        },
      ])('when $missing is missing', ({ error }) => {
        it('should return false', () => {
          expect(isApiError(error)).toBe(false);
        });
      });

      describe.each([
        { error: { name: 'Error', message: 'test', status: 500 }, issue: 'wrong name' },
        { error: { name: 'ApiError', message: 123, status: 500 }, issue: 'non-string message' },
        { error: { name: 'ApiError', message: 'test', status: '500' }, issue: 'non-number status' },
      ])('when ApiError has $issue', ({ error }) => {
        it('should return false', () => {
          expect(isApiError(error)).toBe(false);
        });
      });
    });
  });

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
    describe('string errors', () => {
      it('should return Error with the string as message', () => {
        const result = normalizeError('Something went wrong');
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('Something went wrong');
      });

      it('should handle empty string', () => {
        const result = normalizeError('');
        expect(result.message).toBe('');
      });
    });

    describe('Error instances', () => {
      it('should return the same Error instance', () => {
        const originalError = new Error('Original error');
        expect(normalizeError(originalError)).toBe(originalError);
      });

      it('should preserve custom error types', () => {
        class CustomError extends Error {
          constructor(message: string) {
            super(message);
            this.name = 'CustomError';
          }
        }
        const customError = new CustomError('Custom message');
        const result = normalizeError(customError);
        expect(result).toBe(customError);
        expect(result.name).toBe('CustomError');
      });
    });

    describe('ApiError handling', () => {
      const baseApiError: ApiError = {
        name: 'ApiError',
        message: 'API request failed',
        status: 400,
      };

      it('should return Error with ApiError message', () => {
        const result = normalizeError(baseApiError);
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('API request failed');
      });

      describe('resolver option', () => {
        it('should use resolved message when resolver returns a value', () => {
          const apiError: ApiError = {
            ...baseApiError,
            data: { error: 'invalid_token' },
          };
          const resolver = (code: string) =>
            code === 'invalid_token' ? 'Session expired' : undefined;

          expect(normalizeError(apiError, { resolver }).message).toBe('Session expired');
        });

        it('should fall back to ApiError message when resolver returns undefined/null', () => {
          const apiError: ApiError = { ...baseApiError, data: { error: 'unknown' } };
          const resolver = () => undefined;

          expect(normalizeError(apiError, { resolver }).message).toBe('API request failed');
        });

        it('should not call resolver when error code is missing or non-string', () => {
          let called = false;
          const resolver = () => {
            called = true;
            return 'Resolved';
          };

          normalizeError(baseApiError, { resolver });
          expect(called).toBe(false);

          normalizeError({ ...baseApiError, data: { error: 123 } }, { resolver });
          expect(called).toBe(false);
        });
      });

      it('should use ApiError message over fallbackMessage when available', () => {
        const result = normalizeError(baseApiError, { fallbackMessage: 'Fallback' });
        expect(result.message).toBe('API request failed');
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
      it('should handle ApiError with empty data object', () => {
        const apiError: ApiError = { name: 'ApiError', message: 'Error', status: 400, data: {} };
        expect(normalizeError(apiError).message).toBe('Error');
      });

      it('should handle various option combinations', () => {
        expect(normalizeError({}, {}).message).toBe('An unknown error occurred');
        expect(normalizeError({}, undefined).message).toBe('An unknown error occurred');
        expect(normalizeError('error', { resolver: () => 'r' }).message).toBe('error');
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
