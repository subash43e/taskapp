// Authentication error mappings for user-friendly messages
export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
}

// Firebase Auth error codes mapped to user-friendly messages
export const AUTH_ERROR_MESSAGES: { [key: string]: string } = {
  // Email/Password Authentication Errors
  'auth/email-already-in-use': 'This email address is already registered. Please try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'Email/password authentication is not enabled. Please contact support.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address. Please check your email or sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  
  // Password Reset Errors
  'auth/expired-action-code': 'The password reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'Invalid password reset link. Please request a new one.',
  
  // Google Sign-in Errors
  'auth/account-exists-with-different-credential': 'An account with this email already exists. Please sign in with your original method.',
  'auth/auth-domain-config-required': 'Authentication configuration error. Please contact support.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  'auth/operation-not-supported-in-this-environment': 'This sign-in method is not supported in your current environment.',
  'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
  'auth/unauthorized-domain': 'This domain is not authorized for authentication.',
  
  // Token/Session Errors
  'auth/expired-custom-token': 'Your session has expired. Please sign in again.',
  'auth/invalid-custom-token': 'Invalid authentication token. Please sign in again.',
  'auth/token-expired': 'Your session has expired. Please sign in again.',
  
  // General Errors
  'auth/internal-error': 'An internal error occurred. Please try again.',
  'auth/invalid-api-key': 'Authentication configuration error. Please contact support.',
  'auth/invalid-user-token': 'Your session is invalid. Please sign in again.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'auth/timeout': 'The request timed out. Please try again.',
};

/**
 * Formats Firebase authentication errors into user-friendly messages
 * @param error - Firebase authentication error
 * @returns User-friendly error message
 */
  export const formatAuthError = (error: unknown): string => {
  if (!error) return 'An unknown error occurred. Please try again.';
  const err = error as { code?: string; message?: string };
  // Check if it's a Firebase error with a code
  if (err.code && typeof err.code === 'string') {
    const userFriendlyMessage = AUTH_ERROR_MESSAGES[err.code];
    if (userFriendlyMessage) {
      return userFriendlyMessage;
    }
  }
  
  // Check if it's a custom error message
  if (err.message && typeof err.message === 'string') {
    // Handle some common error patterns that might not have codes
    const message = err.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    if (message.includes('timeout')) {
      return 'The request timed out. Please try again.';
    }
    if (message.includes('quota') || message.includes('limit')) {
      return 'Too many requests. Please try again later.';
    }
    
    // Return the original message if it's already user-friendly (doesn't contain technical terms)
    if (!message.includes('firebase') && !message.includes('auth/') && message.length < 200) {
      return err.message;
    }
  }
  
  // Fallback for unrecognized errors
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Validation result object
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email address cannot be empty. Email address is required.' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }
  
  return { isValid: true };
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Validation result object
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required.' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }
  
  // Optional: Add more password strength requirements
  // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
  //   return { isValid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' };
  // }
  
  return { isValid: true };
};

/**
 * Validates form data for authentication
 * @param email - Email address
 * @param password - Password
 * @returns Validation result with errors array
 */
export const validateAuthForm = (email: string, password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid && emailValidation.message) {
    errors.push(emailValidation.message);
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid && passwordValidation.message) {
    errors.push(passwordValidation.message);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
