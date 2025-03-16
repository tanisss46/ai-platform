import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  hideHeader = false, 
  hideFooter = false 
}) => {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDashboard = router.pathname.startsWith('/dashboard');

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">
      {!hideHeader && (
        <header className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 ${
          isDashboard ? 'shadow-sm' : ''
        }`}>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h6a1 1 0 010 2H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">AI Platform</span>
              </Link>

              {/* Main Navigation - Only show on non-dashboard pages */}
              {!isDashboard && (
                <nav className="hidden md:flex space-x-8">
                  <Link href="/features" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Pricing
                  </Link>
                  <Link href="/docs" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Documentation
                  </Link>
                  <Link href="/blog" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Blog
                  </Link>
                </nav>
              )}

              {/* Right Side Items */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  aria-label="Toggle dark mode"
                >
                  {resolvedTheme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                {/* Non-Dashboard Authentication */}
                {!isDashboard && (
                  <>
                    <Link href="/login" className="hidden md:inline-flex text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
                      Log in
                    </Link>
                    <Link href="/signup" className="btn btn-primary btn-sm px-4">
                      Sign up
                    </Link>
                  </>
                )}
                
                {/* Mobile Menu Button - Only on non-dashboard pages */}
                {!isDashboard && (
                  <button className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow">{children}</main>

      {!hideFooter && !isDashboard && (
        <footer className="bg-slate-100 dark:bg-slate-800 py-12 border-t border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Link href="/" className="flex items-center space-x-2 mb-4">
                  <span className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h6a1 1 0 010 2H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">AI Platform</span>
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  The ultimate AI platform for all your creative needs.
                </p>
                <div className="flex space-x-4">
                  {/* Social Media Links */}
                  <a href="#" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  Platform
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/integrations" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Integrations
                    </Link>
                  </li>
                  <li>
                    <Link href="/changelog" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Changelog
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  Resources
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/docs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/tutorials" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Tutorials
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} AI Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
