import React from 'react';
import { useGetFileQuery, useGetFolderQuery } from '@/store/api/apiSlice';
import FileIcon from './components/FileIcon';

interface FileDetailsProps {
  selectedItems: string[];
}

const FileDetails: React.FC<FileDetailsProps> = ({ selectedItems }) => {
  // Display details for the first selected item
  const selectedId = selectedItems[0];

  // Try to get the item as a file
  const { 
    data: file, 
    isLoading: isFileLoading, 
    error: fileError 
  } = useGetFileQuery(selectedId, { skip: !selectedId });

  // Try to get the item as a folder
  const { 
    data: folder, 
    isLoading: isFolderLoading, 
    error: folderError 
  } = useGetFolderQuery(selectedId, { skip: !selectedId });

  const isLoading = isFileLoading || isFolderLoading;
  const error = fileError || folderError;

  if (!selectedId) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
        No item selected
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading item details
      </div>
    );
  }

  // If we have a file
  if (file) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center mb-6">
          <FileIcon 
            type={file.type} 
            mimeType={file.mimeType}
            size={64}
            className="mb-3" 
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
            {file.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              Size
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {formatFileSize(file.size)}
            </p>
          </div>

          {file.dimensions && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                Dimensions
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {file.dimensions.width} × {file.dimensions.height}
              </p>
            </div>
          )}

          {file.duration && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                Duration
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {formatDuration(file.duration)}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              MIME Type
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {file.mimeType}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              Created
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {new Date(file.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              Modified
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {new Date(file.updatedAt).toLocaleString()}
            </p>
          </div>

          {file.tags && file.tags.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {file.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col space-y-2">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
            Download
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded transition-colors">
            Share
          </button>
        </div>
      </div>
    );
  }

  // If we have a folder
  if (folder) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center mb-6">
          <FileIcon 
            type="folder" 
            size={64}
            className="mb-3" 
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
            {folder.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Folder
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              Created
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {new Date(folder.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              Modified
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {new Date(folder.updatedAt).toLocaleString()}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
              Path
            </h4>
            <p className="text-gray-700 dark:text-gray-300 break-all">
              {folder.path ? folder.path.join(' / ') : '/'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col space-y-2">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
            Open
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded transition-colors">
            Share
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
      No details available
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

export default FileDetails;
