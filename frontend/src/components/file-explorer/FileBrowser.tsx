import React from 'react';
import { Folder, ContentFile } from '@/store/api/apiSlice';
import FileIcon from './components/FileIcon';

export type ViewMode = 'list' | 'grid' | 'details';

interface FileBrowserProps {
  folders: Folder[];
  files: ContentFile[];
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  selectedItems: string[];
  onFolderClick: (folderId: string) => void;
  onItemSelect: (id: string, isMultiSelect: boolean) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  folders,
  files,
  isLoading,
  error,
  viewMode,
  selectedItems,
  onFolderClick,
  onItemSelect,
}) => {
  // Handle item click
  const handleItemClick = (id: string, event: React.MouseEvent) => {
    // Check if Ctrl/Cmd key is pressed for multi-select
    const isMultiSelect = event.ctrlKey || event.metaKey;
    onItemSelect(id, isMultiSelect);
  };

  // Handle folder double click (navigation)
  const handleFolderDoubleClick = (folderId: string) => {
    onFolderClick(folderId);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading files...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-2">
          <svg
            className="h-12 w-12"
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
        <p className="text-gray-800 dark:text-gray-200 font-medium">Error loading files</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{error}</p>
      </div>
    );
  }

  // Display empty state
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-400 mb-2">
          <svg
            className="h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">This folder is empty</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Upload files or create a new folder to get started
        </p>
      </div>
    );
  }

  // Render content based on view mode
  const renderItems = () => {
    // Combine folders and files for display
    const allItems = [
      ...folders.map(folder => ({ ...folder, itemType: 'folder' as const })),
      ...files.map(file => ({ ...file, itemType: 'file' as const })),
    ];

    // Grid View
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          {allItems.map(item => {
            const id = item.id;
            const isSelected = selectedItems.includes(id);
            const isFolder = item.itemType === 'folder';

            return (
              <div
                key={id}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors cursor-pointer ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={(e) => handleItemClick(id, e)}
                onDoubleClick={() => isFolder && handleFolderDoubleClick(id)}
              >
                {isFolder ? (
                  <FileIcon type="folder" size={56} />
                ) : (
                  <FileIcon
                    type={(item as ContentFile).type}
                    mimeType={(item as ContentFile).mimeType}
                    size={56}
                  />
                )}
                <p className="mt-2 text-sm text-center truncate w-full">
                  {item.name}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    // List View
    if (viewMode === 'list') {
      return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {allItems.map(item => {
            const id = item.id;
            const isSelected = selectedItems.includes(id);
            const isFolder = item.itemType === 'folder';

            return (
              <div
                key={id}
                className={`flex items-center py-2 px-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={(e) => handleItemClick(id, e)}
                onDoubleClick={() => isFolder && handleFolderDoubleClick(id)}
              >
                <div className="mr-3">
                  {isFolder ? (
                    <FileIcon type="folder" size={24} />
                  ) : (
                    <FileIcon
                      type={(item as ContentFile).type}
                      mimeType={(item as ContentFile).mimeType}
                      size={24}
                    />
                  )}
                </div>
                <div className="flex-1 truncate">{item.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isFolder ? 'Folder' : (item as ContentFile).type}
                </div>
                <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Details View
    return (
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Modified
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {allItems.map(item => {
            const id = item.id;
            const isSelected = selectedItems.includes(id);
            const isFolder = item.itemType === 'folder';

            return (
              <tr
                key={id}
                className={`transition-colors cursor-pointer ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={(e) => handleItemClick(id, e)}
                onDoubleClick={() => isFolder && handleFolderDoubleClick(id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      {isFolder ? (
                        <FileIcon type="folder" size={24} />
                      ) : (
                        <FileIcon
                          type={(item as ContentFile).type}
                          mimeType={(item as ContentFile).mimeType}
                          size={24}
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isFolder ? 'Folder' : (item as ContentFile).type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isFolder ? '-' : formatFileSize((item as ContentFile).size)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return <div className="h-full overflow-auto">{renderItems()}</div>;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default FileBrowser;
