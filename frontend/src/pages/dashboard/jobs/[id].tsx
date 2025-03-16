import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import JobDetail from '@/components/jobs/JobDetail';
import { useGetJobQuery } from '@/store/api/apiSlice';

const JobDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: job } = useGetJobQuery(id as string, {
    skip: !id,
  });

  // Get the job name for the title (if available)
  const getJobTitle = () => {
    if (!job) return 'Job Details';
    
    // Try to use the prompt as the job name
    if (job.parameters.prompt) {
      const prompt = job.parameters.prompt as string;
      return prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
    }
    
    // Otherwise use the job ID
    return `Job ${id}`;
  };

  return (
    <>
      <Head>
        <title>{getJobTitle()} | AICloud</title>
        <meta name="description" content="View details of your AI generation job" />
      </Head>

      <JobDetail />
    </>
  );
};

JobDetailPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default JobDetailPage;
