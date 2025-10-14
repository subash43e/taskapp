"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export default function Forbidden() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 403 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-orange-600 mb-4">403</div>
          <div className="text-6xl mb-4">🚫</div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Forbidden
        </h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this resource. Please sign in with the appropriate account.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {user ? (
            <>
              <Link
                href="/Inbox"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Go Back
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Sign In
              </Link>
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Go Back
              </button>
            </>
          )}

          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact your administrator.</p>
        </div>
      </div>
    </div>
  );
}