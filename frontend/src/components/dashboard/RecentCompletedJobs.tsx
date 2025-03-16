import React from 'react';
import Link from 'next/link';
import { useGetJobsQuery, Job } from '@/store/api/apiSlice';
import JobStatusBadge from '../jobs/JobStatusBadge';

const RecentCompletedJobs: React.FC = () => {
  const { data: jobs, isLoading, error } = useGetJobsQuery();

  // Filter completed jobs
  const completedJobs = React.useMemo(() => {
    if (!jobs) return [];
    return jobs
      .filter(job => job.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())
      .slice(0, 4); // Show only the 4 most recent
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Completed Jobs</h2>
        <div className="animate-pulse grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Completed Jobs</h2>
        <div className="text-red-500 text-center py-4">
          Failed to load jobs
        </div>
      </div>
    );
  }

  if (!completedJobs || completedJobs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Completed Jobs</h2>
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No completed jobs yet</p>
          <div className="mt-4">
            <Link
              href="/dashboard/tools"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="-ml-1 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create a Job
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Completed Jobs</h2>
        <Link
          href="/dashboard/jobs?status=completed"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {completedJobs.map((job) => (
          <CompletedJobItem key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

// Completed Job Item Component with preview
const CompletedJobItem: React.FC<{ job: Job }> = ({ job }) => {
  // Format timestamp to "X time ago"
  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* Placeholder Preview - In a real app this would show actual content */}
        <div className="h-24 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg
            className="h-10 w-10 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        
        {/* Info */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {job.parameters.prompt
                  ? String(job.parameters.prompt).substring(0, 40) + '...'
                  : `${job.modelId} job`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {job.modelId} • {formatTimeAgo(job.completedAt || job.createdAt)}
              </p>
            </div>
            <JobStatusBadge status={job.status} size="sm" showLabel={false} />
          </div>
          
          {/* Output count */}
          {job.outputContentIds && job.outputContentIds.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {job.outputContentIds.length} output{job.outputContentIds.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RecentCompletedJobs;
