import React from 'react';
import { JobStatus } from './JobStatusBadge';

interface JobProgressBarProps {
  status: JobStatus;
  progress: number;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const JobProgressBar: React.FC<JobProgressBarProps> = ({
  status,
  progress,
  showPercentage = true,
  height = 'md',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Ensure progress is between 0 and 100
  const validProgress = Math.min(Math.max(progress, 0), 100);
  
  // Determine if progress bar should be animated
  const isAnimated = status === 'processing' && validProgress < 100;
  
  // Height classes
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(validProgress)}%
          </span>
        )}
      </div>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${getStatusColor()} ${
            isAnimated ? 'animate-pulse' : ''
          } transition-all duration-500 ease-in-out rounded-full`}
          style={{ width: `${validProgress}%` }}
        />
      </div>
    </div>
  );
};

export default JobProgressBar;
