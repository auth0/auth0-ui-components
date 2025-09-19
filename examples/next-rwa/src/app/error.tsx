'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  // Check if it's an Auth0-related error
  const isAuth0Error =
    error.message.includes('JWEDecryptionFailed') ||
    error.message.includes('decryption') ||
    error.message.includes('Auth0');

  if (isAuth0Error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 text-center mb-6">
            There was a problem with your session. Please clear your browser data and try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                // Clear local storage and cookies
                localStorage.clear();
                sessionStorage.clear();
                // Redirect to logout to clear Auth0 session
                window.location.href = '/api/auth/logout';
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Session & Restart
            </button>
            <button
              onClick={reset}
              className="w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={reset}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
