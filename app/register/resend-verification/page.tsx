'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent. Please check your inbox.');
        setTimeout(() => {
          router.push('/login');
        }, 4000);
      } else {
        setError(data.message || 'Failed to send verification email.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-white backdrop-blur-lg bg-opacity-80 p-8 rounded-3xl shadow-2xl ring-1 ring-gray-100 transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2 tracking-tight">
          Almost there!
        </h1>
        <p className="text-sm text-center mb-6 text-red-600">
          We’ve sent a verification link to your email. Just click the link to verify your account.
        </p>

        {message && (
          <div className="flex items-start gap-2 mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm animate-fade-in">
            <XCircle className="w-5 h-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white text-gray-800"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-white tracking-wide transition-all duration-300 ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-500 hover:underline hover:text-blue-600">
            Back to Login
          </Link>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
