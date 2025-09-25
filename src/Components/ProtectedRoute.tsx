"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import InlineLoader from './InlineLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, no need to show loading
    if (user) {
      setShowLoading(false);
      return;
    }

    // Quick check for auth state - only show loading if there's a delay
    const quickCheck = setTimeout(() => {
      if (!user && !loading) {
        setShowLoading(true);
      }
    }, 100); // Even faster - 100ms

    return () => clearTimeout(quickCheck);
  }, [user, loading]);

  useEffect(() => {
    // If user is not authenticated after a brief moment, redirect
    if (!loading && !user && showLoading) {
      const redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 100); // Quick redirect

      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, showLoading, router]);

  // Only show loading if there's an actual delay in auth state
  if (showLoading && !user) {
    return <InlineLoader size="sm" message="Authenticating..." />;
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}