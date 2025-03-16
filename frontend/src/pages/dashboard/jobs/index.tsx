import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import JobsList from '@/components/jobs/JobsList';

const JobsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Jobs | AICloud</title>
        <meta name="description" content="View and manage your AI generation jobs" />
      </Head>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your AI content generation jobs
          </p>
        </div>

        <JobsList showFilters={true} />
      </div>
    </>
  );
};

JobsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default JobsPage;
