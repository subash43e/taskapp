"use client";

import { useState, useEffect } from 'react';
import { auth } from '../../Firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setLoading, setError, clearError } from '../../authSlice';
import { showNotification } from '../../notificationSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatAuthError, validateAuthForm } from '../../utils/authErrors';
import AuthError from '../../Components/AuthError';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state: import("@/src/store").RootState) => state.auth);

  useEffect(() => {
    // If user is already logged in, redirect immediately
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Clear errors when component unmounts or user changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error || fieldErrors.length > 0) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        setFieldErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, fieldErrors, dispatch]);

  const validateSignupForm = (email: string, password: string, confirmPassword: string) => {
    const baseValidation = validateAuthForm(email, password);
    const errors = [...baseValidation.errors];
    
    if (password !== confirmPassword) {
      errors.push('Passwords do not match.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    setFieldErrors([]);
    
    // Validate form
    const validation = validateSignupForm(email, password, confirmPassword);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    
    dispatch(setLoading(true));
    try {
      
      // Immediately sign out the user
      await signOut(auth);
      
      // Show success message and redirect to login
      dispatch(showNotification({
        message: `Account created successfully for ${email}! Please sign in to continue.`,
        type: 'success'
      }));
      
      // Clear any user state
      dispatch(setUser(null));
      dispatch(setLoading(false));
      
      // Redirect to login page
      router.push('/login');
    } catch (error: unknown) {
      const formattedError = formatAuthError(error);
      dispatch(setError(formattedError));
    }
  };

  const handleGoogleSignup = async () => {
    dispatch(clearError());
    setFieldErrors([]);
    dispatch(setLoading(true));
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user or existing user
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      if (isNewUser) {
        // New user - sign them out and redirect to login
        await signOut(auth);
        dispatch(showNotification({
          message: 'Account created successfully with Google! Please sign in to continue.',
          type: 'success'
        }));
        dispatch(setUser(null));
        dispatch(setLoading(false));
        router.push('/login');
      } else {
        // Existing user - this should redirect them to login page since they're on signup
        await signOut(auth);
        dispatch(showNotification({
          message: 'Account already exists. Please sign in instead.',
          type: 'info'
        }));
        dispatch(setUser(null));
        dispatch(setLoading(false));
        router.push('/login');
      }
    } catch (error: unknown) {
      const formattedError = formatAuthError(error);
      dispatch(setError(formattedError));
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
    setFieldErrors([]);
  };

  if (user) {
    // User is logged in, redirecting...
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        
        {/* Display authentication errors */}
        {error && (
          <AuthError error={error} onClose={handleClearError} />
        )}
        
        {/* Display field validation errors */}
        {fieldErrors.length > 0 && (
          <div className="mb-4">
            {fieldErrors.map((fieldError, index) => (
              <AuthError key={index} error={fieldError} onClose={handleClearError} />
            ))}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleEmailSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  fieldErrors.some(err => err.toLowerCase().includes('email')) 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  fieldErrors.some(err => err.toLowerCase().includes('password')) 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  fieldErrors.some(err => err.toLowerCase().includes('password')) 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
        <div>
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {loading ? 'Creating account...' : 'Create Account with Google'}
          </button>
        </div>
        <div className="text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}