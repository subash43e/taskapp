"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-red-600 mb-4">500</div>
          <div className="text-6xl mb-4">💥</div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-8">
          We&apos;re sorry, but something unexpected happened. Our team has been notified.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-sm text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-sm text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </button>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If this problem persists, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}