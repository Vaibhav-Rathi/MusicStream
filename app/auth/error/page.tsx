'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const AuthError = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  let errorMessage = 'An error occurred during authentication.';
  
  if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid email or password.';
  } else if (error === 'Email not verified. Please verify your email first.') {
    errorMessage = 'Email not verified. Please check your inbox and verify your email before logging in.';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-8 bg-white rounded shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Authentication Error</h1>
        <p className="mb-6 text-center">
          {errorMessage}
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Login
          </Link>
          {error === 'Email not verified. Please verify your email first.' && (
            <Link 
              href="/resend-verification"  
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Resend Verification
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthErrorPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthError />
  </Suspense>
);

export default AuthErrorPage;
