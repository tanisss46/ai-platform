import React from 'react';
import Link from 'next/link';

interface File {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | '3d' | 'document' | 'folder';
  updatedAt: string;
  size: string;
  thumbnail?: string;
}

const RecentFiles: React.FC = () => {
  // Mock data
  const recentFiles: File[] = [
    {
      id: '1',
      name: 'Mountain Landscape.png',
      type: 'image',
      updatedAt: '2023-10-28T14:32:00Z',
      size: '2.4 MB',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzQjgyRjYiLz48cGF0aCBkPSJNNzAgNDVMODUgNzBINTVMNzAgNDVaIiBmaWxsPSIjOTJDNUZEIi8+PHBhdGggZD0iTTMwIDQwTDU1IDgwSDE1TDMwIDQwWiIgZmlsbD0iIzkyQzVGRCIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iMzAiIHI9IjgiIGZpbGw9IiNGRUQ3QUEiLz48L3N2Zz4=',
    },
    {
      id: '2',
      name: 'Product Demo.mp4',
      type: 'video',
      updatedAt: '2023-10-27T10:15:00Z',
      size: '18.7 MB',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM4QjVDRjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iI0QzRDNGRSIvPjxwYXRoIGQ9Ik00NiA0MEw2MCA1MEw0NiA2MFY0MFoiIGZpbGw9IiM4QjVDRjYiLz48L3N2Zz4=',
    },
    {
      id: '3',
      name: 'Space Background Sounds.wav',
      type: 'audio',
      updatedAt: '2023-10-26T18:45:00Z',
      size: '5.1 MB',
    },
    {
      id: '4',
      name: 'Character Model.glb',
      type: '3d',
      updatedAt: '2023-10-25T09:20:00Z',
      size: '12.3 MB',
    },
    {
      id: '5',
      name: 'Project Notes.md',
      type: 'document',
      updatedAt: '2023-10-24T16:10:00Z',
      size: '42 KB',
    },
    {
      id: '6',
      name: 'Marketing Assets',
      type: 'folder',
      updatedAt: '2023-10-23T11:30:00Z',
      size: '4 items',
    },
  ];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get icon for file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case '3d':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Files</h3>
        <Link href="/dashboard/files" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentFiles.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/25 transition-colors">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {file.thumbnail ? (
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={file.thumbnail}
                          alt={file.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {file.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(file.updatedAt)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {file.size}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentFiles;
