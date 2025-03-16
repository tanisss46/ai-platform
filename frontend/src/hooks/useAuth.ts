import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '@/store/store';
import { useGetCurrentUserQuery } from '@/store/api/apiSlice';
import { setCredentials, logout } from '@/store/slices/authSlice';

export function useAuth({ redirectTo = '', redirectIfFound = false } = {}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Skip the query if not authenticated or don't have a token
  const { data, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    // If token exists but we don't have user data, fetch the user
    if (token && data?.user && !isAuthenticated) {
      dispatch(setCredentials({
        user: data.user,
        token,
      }));
    }

    // If token exists but user fetch failed (token invalid/expired)
    if (token && error) {
      dispatch(logout());
    }

    // Handle redirects
    if (!isLoading) {
      if (redirectTo && !redirectIfFound && !isAuthenticated) {
        router.push(redirectTo);
      }
      if (redirectTo && redirectIfFound && isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [token, isAuthenticated, data, error, redirectTo, redirectIfFound, isLoading, dispatch, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
