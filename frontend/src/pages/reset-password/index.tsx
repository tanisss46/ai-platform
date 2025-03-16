import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useTheme } from '@/context/ThemeContext';

export default function ResetPassword() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Get token from URL query params
  useEffect(() => {
    if (router.isReady) {
      const { token: urlToken } = router.query;
      
      if (typeof urlToken === 'string') {
        setToken(urlToken);
        // In a real app, you would validate the token here
        validateToken(urlToken);
      } else {
        setIsTokenValid(false);
        setError('Invalid or missing reset token. Please request a new password reset link.');
      }
    }
  }, [router.isReady, router.query]);

  // Mock token validation function
  const validateToken = async (token: string) => {
    // In a real app, you would make an API call to validate the token
    // For demo purposes, we'll consider all tokens valid except "invalid-token"
    if (token === 'invalid-token') {
      setIsTokenValid(false);
      setError('This password reset link has expired or is invalid. Please request a new one.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would make an API call to reset the password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setIsSuccessful(true);
    } catch (error) {
      setError('An error occurred while resetting your password. Please try again.');
      console.error('Reset password error:', error);
    }
    
    setIsLoading(false);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <Head>
        <title>Reset Password | AI Platform</title>
        <meta name="description" content="Reset your AI Platform password" />
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15.5V17.5M17.5 12H19.5M17.5 7L19.2 5.3M7 17.5L5.3 19.2M4.5 12H6.5M7 6.5L5.3 4.8M12 6.5V4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">AI Platform</span>
          </Link>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                {!isTokenValid ? (
                  <div className="text-center py-6">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                      <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Invalid Reset Link
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {error}
                    </p>
                    <Link
                      href="/forgot-password"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800"
                    >
                      Request New Reset Link
                    </Link>
                  </div>
                ) : isSuccessful ? (
                  <div className="text-center py-6">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Password Reset Successful
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800"
                    >
                      Go to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Create new password
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400">
                        Enter your new password below
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                          {error}
                        </div>
                      )}

                      <div>
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="form-control"
                          placeholder="Enter your new password"
                          required
                          minLength={8}
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Password must be at least 8 characters long
                        </p>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="form-control"
                          placeholder="Confirm your new password"
                          required
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="w-full btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="loading mr-2"></div>
                              Resetting password...
                            </div>
                          ) : (
                            'Reset Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Remember your password?{' '}
                    <Link
                      href="/login"
                      className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                    >
                      Back to login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} AI Platform. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
