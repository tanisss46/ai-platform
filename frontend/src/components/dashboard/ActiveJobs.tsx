import React from 'react';
import Link from 'next/link';
import { useGetJobsQuery, Job } from '@/store/api/apiSlice';
import JobStatusBadge from '../jobs/JobStatusBadge';
import JobProgressBar from '../jobs/JobProgressBar';

const ActiveJobs: React.FC = () => {
  const { data: jobs, isLoading, error } = useGetJobsQuery();

  // Filter active jobs (queued and processing)
  const activeJobs = React.useMemo(() => {
    if (!jobs) return [];
    return jobs
      .filter(job => job.status === 'queued' || job.status === 'processing')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3); // Show only the 3 most recent
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Jobs</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Jobs</h2>
        <div className="text-red-500 text-center py-4">
          Failed to load jobs
        </div>
      </div>
    );
  }

  if (!activeJobs || activeJobs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Jobs</h2>
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No active jobs at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Jobs</h2>
        <Link
          href="/dashboard/jobs"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {activeJobs.map((job) => (
          <JobItem key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

// Job Item Component
const JobItem: React.FC<{ job: Job }> = ({ job }) => {
  // Get model icon
  const getModelIcon = () => {
    switch (job.modelId) {
      case 'midjourney':
      case 'stable-diffusion':
        return '/icons/image-icon.svg';
      case 'kling-ai':
        return '/icons/video-icon.svg';
      case 'mmaudio':
        return '/icons/audio-icon.svg';
      default:
        return '/icons/ai-icon.svg';
    }
  };

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
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="h-8 w-8 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
              <img src={getModelIcon()} alt={job.modelId} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {job.parameters.prompt
                    ? String(job.parameters.prompt).substring(0, 40) + '...'
                    : `${job.modelId} job`}
                </p>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(job.createdAt)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {job.modelId}
              </p>
            </div>
          </div>
          <JobStatusBadge status={job.status} size="sm" />
        </div>
        <JobProgressBar status={job.status} progress={job.progress} height="sm" showPercentage={false} />
      </div>
    </Link>
  );
};

export default ActiveJobs;
