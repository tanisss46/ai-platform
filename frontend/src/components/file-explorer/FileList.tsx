import React from 'react';
import { ViewMode } from './FileExplorer';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface File {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

interface FileListProps {
  files: File[];
  viewMode: ViewMode;
  selectedItems: string[];
  onItemSelect: (id: string, isMultiSelect: boolean) => void;
  onItemOpen: (file: File) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  viewMode,
  selectedItems,
  onItemSelect,
  onItemOpen,
}) => {
  const handleItemClick = (id: string, e: React.MouseEvent) => {
    // Check if user is holding Ctrl (Windows) or Cmd (Mac) for multi-select
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onItemSelect(id, isMultiSelect);
  };
  
  const handleItemDoubleClick = (file: File) => {
    onItemOpen(file);
  };
  
  const getFileIcon = (type: string, mimeType: string) => {
    // Return appropriate icon based on file type
    switch (type) {
      case 'image':
        return <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'video':
        return <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
      case 'audio':
        return <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;
      case 'document':
        return <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case '3d':
        return <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      default:
        return <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    }
  };
  
  // Grid View (default)
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
              selectedItems.includes(file.id) 
                ? 'bg-blue-100 border border-blue-300' 
                : 'hover:bg-gray-100 border border-transparent'
            }`}
            onClick={(e) => handleItemClick(file.id, e)}
            onDoubleClick={() => handleItemDoubleClick(file)}
          >
            {file.thumbnailUrl ? (
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <img 
                  src={file.thumbnailUrl} 
                  alt={file.name} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                {getFileIcon(file.type, file.mimeType)}
              </div>
            )}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 truncate w-24">
                {file.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // List View
  if (viewMode === 'list') {
    return (
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modified
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file) => (
              <tr 
                key={file.id}
                className={`${
                  selectedItems.includes(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                } cursor-pointer`}
                onClick={(e) => handleItemClick(file.id, e)}
                onDoubleClick={() => handleItemDoubleClick(file)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      {file.thumbnailUrl ? (
                        <img className="h-8 w-8 object-cover" src={file.thumbnailUrl} alt="" />
                      ) : (
                        getFileIcon(file.type, file.mimeType)
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {file.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{file.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(file.updatedAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  // Details View
  return (
    <div className="border-t border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr 
              key={file.id}
              className={`${
                selectedItems.includes(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
              } cursor-pointer`}
              onClick={(e) => handleItemClick(file.id, e)}
              onDoubleClick={() => handleItemDoubleClick(file)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                    {file.thumbnailUrl ? (
                      <img className="h-8 w-8 object-cover" src={file.thumbnailUrl} alt="" />
                    ) : (
                      getFileIcon(file.type, file.mimeType)
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {file.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{file.type}</div>
                <div className="text-xs text-gray-400">{file.mimeType}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatDate(file.createdAt)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatDate(file.updatedAt)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;