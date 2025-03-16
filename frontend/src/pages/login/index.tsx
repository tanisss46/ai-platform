import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useTheme } from '@/context/ThemeContext';
import { useLoginMutation } from '@/store/api/apiSlice';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { redirect } = router.query;

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push(typeof redirect === 'string' ? redirect : '/dashboard');
    }
  }, [router, redirect]);

  // Use the login mutation hook from RTK Query
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Call the actual login API endpoint
      const result = await login({ email, password }).unwrap();
      
      // Set credentials in Redux store and localStorage
      dispatch(setCredentials({
        user: result.user,
        token: result.accessToken
      }));
      
      // Redirect to dashboard or the original requested page
      router.push(typeof redirect === 'string' ? redirect : '/dashboard');
      
    } catch (error: any) {
      // Handle different API error responses
      const errorMessage = error.data?.message || 'Failed to login. Please try again.';
      setErrorMessage(errorMessage);
      console.error('Login error:', error);
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
        <title>Log In | AI Platform</title>
        <meta name="description" content="Log in to your AI Platform account" />
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
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    Log in to your AI Platform account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full btn btn-primary"
                      disabled={isLoading || isLoginLoading}
                    >
                      {(isLoading || isLoginLoading) ? (
                        <div className="flex items-center justify-center">
                          <div className="loading mr-2"></div>
                          Logging in...
                        </div>
                      ) : (
                        'Log in'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link
                      href="/signup"
                      className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>

                {/* Demo Credentials */}
                {/* Only show demo credentials in development mode */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-8 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Demo Credentials
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Email: <span className="font-medium text-slate-700 dark:text-slate-300">demo@example.com</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Password: <span className="font-medium text-slate-700 dark:text-slate-300">password</span>
                    </p>
                  </div>
                )}
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
