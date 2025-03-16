import React from 'react';
import Link from 'next/link';
import JobStatusBadge from './JobStatusBadge';
import JobProgressBar from './JobProgressBar';
import { Job } from '@/store/api/apiSlice';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // Get model details
  const getModelIcon = () => {
    switch (job.modelId) {
      case 'midjourney':
        return '/icons/image-icon.svg';
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

  // Format job name based on parameters
  const getJobName = () => {
    if (job.parameters.prompt) {
      // If prompt is too long, truncate it
      const prompt = job.parameters.prompt as string;
      return prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;
    }
    
    return `${job.modelId} job ${job.id.substring(0, 8)}`;
  };

  // Format the time the job was created
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                <img
                  src={getModelIcon()}
                  alt={job.modelId}
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium">
                  {getJobName()}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {job.modelId} • {getTimeAgo()}
                </p>
              </div>
            </div>
            <JobStatusBadge status={job.status} size="sm" />
          </div>

          <div className="mt-4">
            <JobProgressBar 
              status={job.status} 
              progress={job.progress} 
              height="sm" 
            />
          </div>

          {/* Output preview (show only if job is completed) */}
          {job.status === 'completed' && job.outputContentIds.length > 0 && (
            <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <svg
                className="w-4 h-4 mr-1"
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
              <span>{job.outputContentIds.length} output{job.outputContentIds.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Error message (show only if job failed) */}
          {job.status === 'failed' && job.error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 truncate">
              Error: {job.error}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
