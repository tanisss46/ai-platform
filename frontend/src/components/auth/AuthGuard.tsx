import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  allowRoles?: string[];
}

/**
 * AuthGuard Component
 * Protects routes that require authentication.
 * 
 * Usage:
 * <AuthGuard>
 *   <ProtectedPage />
 * </AuthGuard>
 */
export function AuthGuard({ 
  children, 
  redirectTo = '/login', 
  allowRoles = ['user', 'admin'] 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the original URL the user was trying to access
        router.push(`${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`);
      } else if (user && allowRoles.length > 0 && !allowRoles.includes(user.role)) {
        // Handle unauthorized role access
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo, user, allowRoles]);

  // Show loading state while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check role access if user exists and allowRoles is provided
  if (user && allowRoles.length > 0 && !allowRoles.includes(user.role)) {
    return null; // Will redirect in the useEffect
  }

  // Render children only when authorized
  return <>{children}</>;
}
