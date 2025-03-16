import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGetJobQuery, useGetFileQuery } from '@/store/api/apiSlice';
import JobStatusBadge from './JobStatusBadge';
import JobProgressBar from './JobProgressBar';
import { formatRelative } from 'date-fns';

const JobDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: job, isLoading, error } = useGetJobQuery(id as string, {
    skip: !id,
    pollingInterval: 5000, // Poll every 5 seconds for updates if job is still processing
  });

  // State for selected output tab (when job has multiple outputs)
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  
  // Get the current output file (if job is completed)
  const currentOutputId = job?.status === 'completed' && job.outputContentIds.length > 0
    ? job.outputContentIds[selectedOutputIndex]
    : null;
  
  const { data: outputFile } = useGetFileQuery(currentOutputId as string, {
    skip: !currentOutputId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="h-16 w-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Job Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The job you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Jobs
        </Link>
      </div>
    );
  }

  // Format the time the job was created/updated
  const getFormattedTime = (dateString: string) => {
    try {
      return formatRelative(new Date(dateString), new Date());
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get model details
  const getModelDetails = () => {
    switch (job.modelId) {
      case 'midjourney':
        return {
          name: 'Midjourney',
          icon: '/icons/image-icon.svg',
          description: 'High-quality image generation',
        };
      case 'stable-diffusion':
        return {
          name: 'Stable Diffusion',
          icon: '/icons/image-icon.svg',
          description: 'Customizable image generation',
        };
      case 'kling-ai':
        return {
          name: 'Kling AI',
          icon: '/icons/video-icon.svg',
          description: 'Video generation from text',
        };
      case 'mmaudio':
        return {
          name: 'MMAudio',
          icon: '/icons/audio-icon.svg',
          description: 'Audio generation from text',
        };
      default:
        return {
          name: job.modelId,
          icon: '/icons/ai-icon.svg',
          description: 'AI generation model',
        };
    }
  };

  const modelDetails = getModelDetails();

  // Determine if job status should automatically refresh
  const shouldRefresh = job.status === 'queued' || job.status === 'processing';
  
  // Render the output preview based on file type
  const renderOutputPreview = () => {
    if (!outputFile) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <svg
              className="mx-auto h-12 w-12 mb-2"
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
            <p>Loading output...</p>
          </div>
        </div>
      );
    }

    switch (outputFile.type) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={outputFile.url}
              alt={outputFile.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );
      case 'video':
        return (
          <div className="flex justify-center">
            <video
              src={outputFile.url}
              controls
              className="max-w-full max-h-96 rounded-lg"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <audio
              src={outputFile.url}
              controls
              className="w-full max-w-md"
            />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <svg
                className="mx-auto h-12 w-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>Preview not available</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Jobs
        </Link>
      </div>

      {/* Job Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {job.parameters.prompt ? job.parameters.prompt.toString().substring(0, 60) + '...' : 'Job Details'}
          </h1>
          <JobStatusBadge status={job.status} size="lg" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Created {getFormattedTime(job.createdAt)} • Job ID: {job.id}
        </p>
      </div>

      {/* Progress bar (if job is still processing) */}
      {shouldRefresh && (
        <div className="mb-6">
          <JobProgressBar
            status={job.status}
            progress={job.progress}
            height="lg"
            showPercentage={true}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {job.status === 'queued' ? 'Waiting in queue...' : 'Processing your request...'}
          </p>
        </div>
      )}

      {/* Output preview (if job is completed) */}
      {job.status === 'completed' && job.outputContentIds.length > 0 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Output tabs (if multiple outputs) */}
            {job.outputContentIds.length > 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto">
                  {job.outputContentIds.map((_, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 text-sm font-medium ${
                        selectedOutputIndex === index
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => setSelectedOutputIndex(index)}
                    >
                      Output {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview content */}
            <div className="p-4">
              {renderOutputPreview()}
            </div>

            {/* Download button */}
            {outputFile && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                <a
                  href={outputFile.url}
                  download={outputFile.name}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message (if job failed) */}
      {job.status === 'failed' && (
        <div className="mb-8">
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Job Failed
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                  <p>{job.error || 'An unknown error occurred while processing your job.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Job Details
          </h2>
        </div>

        <div className="px-6 py-4">
          {/* Model information */}
          <div className="flex items-start mb-6">
            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
              <img
                src={modelDetails.icon}
                alt={modelDetails.name}
                className="h-6 w-6"
              />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-medium">
                {modelDetails.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {modelDetails.description}
              </p>
            </div>
          </div>

          {/* Parameters */}
          <div className="mb-6">
            <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
              Parameters
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="space-y-3">
                {Object.entries(job.parameters).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {key}
                    </div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-gray-300 break-words">
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timing and credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                Timing
              </h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Created
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {getFormattedTime(job.createdAt)}
                  </div>
                </div>
                {job.startedAt && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Started
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {getFormattedTime(job.startedAt)}
                    </div>
                  </div>
                )}
                {job.completedAt && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completed
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {getFormattedTime(job.completedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                Credits
              </h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Credits Used
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {job.creditsUsed}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
