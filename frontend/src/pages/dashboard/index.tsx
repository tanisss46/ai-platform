import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { RootState } from '@/store/store';
import { setLoading } from '@/store/slices/uiSlice';

// Dashboard components
import StorageStats from '@/components/dashboard/StorageStats';
import RecentFiles from '@/components/dashboard/RecentFiles';
import PopularTools from '@/components/dashboard/PopularTools';
import CreditUsage from '@/components/dashboard/CreditUsage';
import ActiveJobs from '@/components/dashboard/ActiveJobs';
import RecentCompletedJobs from '@/components/dashboard/RecentCompletedJobs';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login?redirect=/dashboard');
        }
      }
      
      // Simulate loading dashboard data
      setTimeout(() => {
        setIsPageLoading(false);
        dispatch(setLoading(false));
      }, 1000);
    }
  }, [isAuthenticated, router, dispatch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | AICloud</title>
        <meta name="description" content="AICloud dashboard - Manage your AI content creation" />
      </Head>
      
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back, {user?.displayName || 'User'}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Jobs */}
            <ActiveJobs />
            
            {/* Recent Completed Jobs */}
            <RecentCompletedJobs />
            
            {/* Recent Files */}
            <RecentFiles />
          </div>
          
          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Credit Usage */}
            <CreditUsage />
            
            {/* Storage Stats */}
            <StorageStats />
            
            {/* Popular Tools */}
            <PopularTools />
          </div>
        </div>
      </div>
    </>
  );
}

Dashboard.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
