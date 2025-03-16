import React, { useState } from 'react';
import { ContentFile } from '@/store/api/apiSlice';
import FileIcon from './FileIcon';

interface FilePreviewProps {
  file: ContentFile;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle media load success
  const handleLoadSuccess = () => {
    setIsLoading(false);
  };

  // Handle media load error
  const handleLoadError = () => {
    setIsLoading(false);
    setError('Failed to load media');
  };

  // Render preview based on file type
  const renderPreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <img
            src={file.url}
            alt={file.name}
            className="max-h-full max-w-full object-contain"
            onLoad={handleLoadSuccess}
            onError={handleLoadError}
          />
        );
      case 'video':
        return (
          <video
            src={file.url}
            controls
            autoPlay
            className="max-h-full max-w-full"
            onLoadedData={handleLoadSuccess}
            onError={handleLoadError}
          />
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center">
            <FileIcon type="audio" size={120} className="mb-6" />
            <audio
              src={file.url}
              controls
              autoPlay
              className="w-full max-w-md"
              onLoadedData={handleLoadSuccess}
              onError={handleLoadError}
            />
          </div>
        );
      case '3d':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <FileIcon type="3d" size={120} className="mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              3D preview not available
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <FileIcon type={file.type} mimeType={file.mimeType} size={120} className="mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Preview not available for this file type
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full h-5/6 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-2xl">
            {file.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error ? (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
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
              <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
            </div>
          ) : (
            renderPreview()
          )}
        </div>

        {/* Footer with file info */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900 rounded-b-lg flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {file.mimeType} • {formatFileSize(file.size)}
            {file.dimensions && ` • ${file.dimensions.width} × ${file.dimensions.height}`}
            {file.duration && ` • ${formatDuration(file.duration)}`}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
              Download
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to format duration in seconds
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default FilePreview;
