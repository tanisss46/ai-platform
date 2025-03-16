import React from 'react';

interface TaskStatusIndicatorProps {
  status: 'idle' | 'planning' | 'executing' | 'completed' | 'failed';
  currentStep?: string;
  progress?: number;
}

const TaskStatusIndicator: React.FC<TaskStatusIndicatorProps> = ({
  status,
  currentStep,
  progress = 0,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-500';
      case 'executing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'executing':
        return 'Running';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Idle';
    }
  };

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-4 py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${getStatusColor()} mr-2`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusLabel()}
          </span>
        </div>
        {status === 'executing' && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {progress}%
          </span>
        )}
      </div>
      {currentStep && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {currentStep}
        </p>
      )}
      {(status === 'executing' || status === 'planning') && (
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStatusColor()} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TaskStatusIndicator;
