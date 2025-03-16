import React, { useState } from 'react';
import { useGetJobsQuery, Job } from '@/store/api/apiSlice';
import JobCard from './JobCard';

type FilterStatus = 'all' | 'queued' | 'processing' | 'completed' | 'failed';

interface JobsListProps {
  limit?: number;
  showFilters?: boolean;
}

const JobsList: React.FC<JobsListProps> = ({ 
  limit,
  showFilters = true
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const { data: jobs, isLoading, error } = useGetJobsQuery();

  // Apply filters
  const filteredJobs = React.useMemo(() => {
    if (!jobs) return [];
    
    // Apply status filter
    let filtered = jobs;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }
    
    // Sort by most recent
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [jobs, filterStatus, limit]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-100 dark:bg-gray-800 animate-pulse h-32 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-500 mb-2">
          <svg
            className="mx-auto h-12 w-12"
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
        <p className="text-gray-800 dark:text-gray-200 font-medium">Failed to load jobs</p>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          An error occurred while loading your jobs. Please try again later.
        </p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          You haven't created any AI generation jobs yet.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard/tools"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Your First Job
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Status filter */}
      {showFilters && (
        <div className="mb-6">
          <div className="flex overflow-x-auto space-x-2 py-2">
            {[
              { value: 'all', label: 'All Jobs' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'queued', label: 'Queued' },
              { value: 'failed', label: 'Failed' }
            ].map((filter) => (
              <button
                key={filter.value}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  filterStatus === filter.value
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFilterStatus(filter.value as FilterStatus)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Job cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">
            No jobs matching the selected filter
          </p>
        </div>
      )}
    </div>
  );
};

export default JobsList;
