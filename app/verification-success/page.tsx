// app/verification-success/page.tsx
import Link from 'next/link';

export default function VerificationSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-8 bg-white rounded shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Email Verified!</h1>
        <p className="mb-6 text-center">
          Your email has been successfully verified. You can now log in to your account.
        </p>
        <div className="flex justify-center">
          <Link 
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}