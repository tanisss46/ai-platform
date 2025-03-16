import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { RootState } from '@/store/store';
import { setActiveView, setSelectedItems, clearSelectedItems } from '@/store/slices/uiSlice';

interface File {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | '3d' | 'document' | 'folder';
  updatedAt: string;
  size: string;
  thumbnail?: string;
  favorite?: boolean;
  parentId?: string;
}

interface Folder {
  id: string;
  name: string;
  type: 'folder';
  updatedAt: string;
  size: string; // Number of items
  parentId?: string;
}

type FileOrFolder = File | Folder;

export default function Files() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { activeView, selectedItems } = useSelector((state: RootState) => state.ui);
  const [currentFiles, setCurrentFiles] = useState<FileOrFolder[]>([]);
  const [currentPath, setCurrentPath] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'size'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string | null>(null);

  // Handle folder navigation
  const navigateToFolder = (folder: Folder) => {
    // In a real app, you would load the files from this folder from an API
    // For this demo, we'll just add the folder to the path
    setCurrentPath([...currentPath, folder]);
    
    // Reset selected items when navigating
    dispatch(clearSelectedItems());
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      // Mock loading files from this folder
      const mockFiles = generateMockFiles(folder.id);
      setCurrentFiles(mockFiles);
      setIsLoading(false);
    }, 500);
  };

  // Handle navigation to parent folder
  const navigateUp = () => {
    if (currentPath.length === 0) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    setCurrentPath(newPath);
    
    // Reset selected items when navigating
    dispatch(clearSelectedItems());
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      // Mock loading files from parent folder
      const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : undefined;
      const mockFiles = generateMockFiles(parentId);
      setCurrentFiles(mockFiles);
      setIsLoading(false);
    }, 500);
  };

  // Toggle selection of an item
  const toggleSelectItem = (item: FileOrFolder) => {
    if (selectedItems.includes(item.id)) {
      dispatch(setSelectedItems(selectedItems.filter(id => id !== item.id)));
    } else {
      dispatch(setSelectedItems([...selectedItems, item.id]));
    }
  };

  // Generate mock files for demo
  const generateMockFiles = (parentId?: string): FileOrFolder[] => {
    if (!parentId) {
      // Root folder
      return [
        {
          id: 'folder-1',
          name: 'Images',
          type: 'folder',
          updatedAt: '2023-10-25T10:30:00Z',
          size: '24 items',
        },
        {
          id: 'folder-2',
          name: 'Videos',
          type: 'folder',
          updatedAt: '2023-10-24T15:45:00Z',
          size: '12 items',
        },
        {
          id: 'folder-3',
          name: 'Audio',
          type: 'folder',
          updatedAt: '2023-10-23T09:15:00Z',
          size: '8 items',
        },
        {
          id: 'folder-4',
          name: '3D Models',
          type: 'folder',
          updatedAt: '2023-10-22T14:20:00Z',
          size: '5 items',
        },
        {
          id: 'file-1',
          name: 'Project Notes.md',
          type: 'document',
          updatedAt: '2023-10-28T11:30:00Z',
          size: '42 KB',
          parentId: undefined,
        },
        {
          id: 'file-2',
          name: 'Dashboard Design.png',
          type: 'image',
          updatedAt: '2023-10-27T16:45:00Z',
          size: '1.8 MB',
          parentId: undefined,
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzQjgyRjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PHJlY3QgeD0iMjAiIHk9IjcwIiB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxyZWN0IHg9IjIwIiB5PSI1MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjUiLz48cmVjdCB4PSI3MCIgeT0iNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+',
          favorite: true,
        },
        {
          id: 'file-3',
          name: 'Introduction Video.mp4',
          type: 'video',
          updatedAt: '2023-10-26T09:15:00Z',
          size: '24.6 MB',
          parentId: undefined,
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM4QjVDRjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iI0QzRDNGRSIvPjxwYXRoIGQ9Ik00NiA0MEw2MCA1MEw0NiA2MFY0MFoiIGZpbGw9IiM4QjVDRjYiLz48L3N2Zz4=',
        },
      ];
    } else if (parentId === 'folder-1') {
      // Images folder
      return [
        {
          id: 'folder-1-1',
          name: 'Landscapes',
          type: 'folder',
          updatedAt: '2023-10-24T11:30:00Z',
          size: '12 items',
          parentId: 'folder-1',
        },
        {
          id: 'folder-1-2',
          name: 'Portraits',
          type: 'folder',
          updatedAt: '2023-10-23T14:45:00Z',
          size: '8 items',
          parentId: 'folder-1',
        },
        {
          id: 'file-1-1',
          name: 'Sunset.png',
          type: 'image',
          updatedAt: '2023-10-28T16:30:00Z',
          size: '2.4 MB',
          parentId: 'folder-1',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGOTdGNTEiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIxNSIgZmlsbD0iI0ZFRDdBQSIvPjxwYXRoIGQ9Ik0wIDcwSDEwMFYxMDBIMFY3MFoiIGZpbGw9IiM0MjhCRjUiLz48cGF0aCBkPSJNMCA2MEwxMDAgNjBMODAgODBMMjAgODBMMCA2MFoiIGZpbGw9IiMyNTU3OUUiLz48L3N2Zz4=',
        },
        {
          id: 'file-1-2',
          name: 'Mountain.png',
          type: 'image',
          updatedAt: '2023-10-27T10:15:00Z',
          size: '3.1 MB',
          parentId: 'folder-1',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNCMkY1RUEiLz48cGF0aCBkPSJNMCA1MEwyMCAzMEw0MCA0MEw2MCAyMEw4MCA0MEwxMDAgNTBWMTAwSDBWNTBaIiBmaWxsPSIjNDI4QkY1Ii8+PHBhdGggZD0iTTYwIDIwTDgwIDQwTDEwMCA1MFYxMDBINjBWNTBMNjAgMjBaIiBmaWxsPSIjMEU3NDkwIi8+PHBhdGggZD0iTTAgNTBMMjAgMzBMNDAgNDBWMTAwSDBWNTBaIiBmaWxsPSIjMjU1NzlFIi8+PHBhdGggZD0iTTYwIDgwTDgwIDYwTDEwMCA4MEwxMDAgMTAwTDYwIDEwMEw2MCA4MFoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=',
          favorite: true,
        },
        {
          id: 'file-1-3',
          name: 'Abstract Art.png',
          type: 'image',
          updatedAt: '2023-10-26T14:45:00Z',
          size: '1.7 MB',
          parentId: 'folder-1',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRkNEOTkiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjMwIiByPSIyMCIgZmlsbD0iI0ZGNkI2QiIvPjxyZWN0IHg9IjIwIiB5PSI1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQTZFNEZGIi8+PHBhdGggZD0iTTAgMEwyMCAwTDEwIDE1TDAgMFoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNTAgNzBMODAgOTBMMzAgOTVMNTAgNzBaIiBmaWxsPSIjOEI1Q0Y2Ii8+PC9zdmc+',
        },
        {
          id: 'file-1-4',
          name: 'Product Mockup.png',
          type: 'image',
          updatedAt: '2023-10-25T09:30:00Z',
          size: '4.2 MB',
          parentId: 'folder-1',
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRkZGRkYiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI0Y1RjVGNSIvPjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjM0I4MkY2Ii8+PHJlY3QgeD0iMzAiIHk9IjU1IiB3aWR0aD0iNDAiIGhlaWdodD0iNSIgZmlsbD0iIzlDQTNBRiIvPjxyZWN0IHg9IjMwIiB5PSI2NSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjUiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=',
        },
      ];
    } else {
      // Other folders - generic content
      return [
        {
          id: `${parentId}-subfolder-1`,
          name: 'Subfolder 1',
          type: 'folder',
          updatedAt: '2023-10-24T11:30:00Z',
          size: '5 items',
          parentId,
        },
        {
          id: `${parentId}-subfolder-2`,
          name: 'Subfolder 2',
          type: 'folder',
          updatedAt: '2023-10-23T14:45:00Z',
          size: '3 items',
          parentId,
        },
        {
          id: `${parentId}-file-1`,
          name: 'Sample File 1.txt',
          type: 'document',
          updatedAt: '2023-10-22T16:30:00Z',
          size: '24 KB',
          parentId,
        },
        {
          id: `${parentId}-file-2`,
          name: 'Sample File 2.txt',
          type: 'document',
          updatedAt: '2023-10-21T10:15:00Z',
          size: '36 KB',
          parentId,
        },
      ];
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  // Load initial data
  useEffect(() => {
    // In a real app, you would fetch the files from an API
    // For this demo, we'll use mock data
    const mockFiles = generateMockFiles();
    
    setTimeout(() => {
      setCurrentFiles(mockFiles);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Sort files
  const sortedFiles = [...currentFiles].sort((a, b) => {
    // Folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    
    // Then sort by selected field
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'updated') {
      return sortOrder === 'asc'
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'size') {
      // This is a simplified sort for size as we're using strings like "12 MB"
      // In a real app, you would have the actual byte sizes
      return sortOrder === 'asc'
        ? a.size.localeCompare(b.size)
        : b.size.localeCompare(a.size);
    }
    
    return 0;
  });

  // Filter files by type if filter is active
  const filteredFiles = filterType
    ? sortedFiles.filter(file => file.type === filterType || (filterType === 'favorite' && (file as File).favorite))
    : sortedFiles;

  // Render breadcrumb
  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm">
      <button
        onClick={() => {
          setCurrentPath([]);
          setCurrentFiles(generateMockFiles());
          dispatch(clearSelectedItems());
        }}
        className="text-primary-600 dark:text-primary-400 hover:underline"
      >
        Home
      </button>
      
      {currentPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => {
              const newPath = currentPath.slice(0, index + 1);
              setCurrentPath(newPath);
              setCurrentFiles(generateMockFiles(folder.id));
              dispatch(clearSelectedItems());
            }}
            className={`${
              index === currentPath.length - 1
                ? 'text-slate-900 dark:text-white font-medium'
                : 'text-primary-600 dark:text-primary-400 hover:underline'
            }`}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredFiles.map((item) => (
        <div
          key={item.id}
          className={`relative group rounded-lg border ${
            selectedItems.includes(item.id)
              ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
          } overflow-hidden`}
        >
          {/* Selection checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleSelectItem(item)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          {/* Favorite star for files */}
          {item.type !== 'folder' && (
            <div className="absolute top-2 right-2 z-10">
              <button className="text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400">
                <svg
                  className={`w-5 h-5 ${
                    (item as File).favorite ? 'text-amber-500 dark:text-amber-400' : ''
                  }`}
                  fill={(item as File).favorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            </div>
          )}
          
          {/* Item content */}
          <div
            className="p-4 flex flex-col items-center cursor-pointer"
            onClick={() => {
              if (item.type === 'folder') {
                navigateToFolder(item as Folder);
              } else {
                // Open the file - in a real app, this would open a file viewer
                console.log('Open file:', item);
              }
            }}
          >
            {/* Thumbnail or icon */}
            <div className="w-full pt-[100%] relative mb-3">
              {item.type === 'folder' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    {getFileIcon(item.type)}
                  </div>
                </div>
              ) : item.type === 'image' && (item as File).thumbnail ? (
                <img
                  src={(item as File).thumbnail}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover rounded"
                />
              ) : item.type === 'video' && (item as File).thumbnail ? (
                <div className="absolute inset-0">
                  <img
                    src={(item as File).thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-slate-900/60 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    item.type === 'image' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    item.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    item.type === 'audio' ? 'bg-green-100 dark:bg-green-900/30' :
                    item.type === '3d' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {getFileIcon(item.type)}
                  </div>
                </div>
              )}
            </div>
            
            {/* File name */}
            <h4 className="text-sm font-medium text-slate-900 dark:text-white text-center line-clamp-1">
              {item.name}
            </h4>
            
            {/* Metadata */}
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
              {item.size}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
              <input
                type="checkbox"
                checked={selectedItems.length > 0 && selectedItems.length === filteredFiles.length}
                onChange={() => {
                  if (selectedItems.length === filteredFiles.length) {
                    dispatch(clearSelectedItems());
                  } else {
                    dispatch(setSelectedItems(filteredFiles.map(file => file.id)));
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer"
              onClick={() => {
                if (sortBy === 'name') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('name');
                  setSortOrder('asc');
                }
              }}
            >
              <div className="flex items-center">
                Name
                {sortBy === 'name' && (
                  <svg
                    className={`w-4 h-4 ml-1 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer"
              onClick={() => {
                if (sortBy === 'updated') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('updated');
                  setSortOrder('desc');
                }
              }}
            >
              <div className="flex items-center">
                Last Modified
                {sortBy === 'updated' && (
                  <svg
                    className={`w-4 h-4 ml-1 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer"
              onClick={() => {
                if (sortBy === 'size') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('size');
                  setSortOrder('desc');
                }
              }}
            >
              <div className="flex items-center">
                Size
                {sortBy === 'size' && (
                  <svg
                    className={`w-4 h-4 ml-1 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {filteredFiles.map((item) => (
            <tr
              key={item.id}
              className={`${
                selectedItems.includes(item.id)
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/25'
              } transition-colors`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (item.type === 'folder') {
                      navigateToFolder(item as Folder);
                    } else {
                      // Open the file
                      console.log('Open file:', item);
                    }
                  }}
                >
                  <div className="flex-shrink-0 h-10 w-10 mr-3">
                    {item.type === 'image' && (item as File).thumbnail ? (
                      <img
                        src={(item as File).thumbnail}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : item.type === 'video' && (item as File).thumbnail ? (
                      <div className="relative h-10 w-10">
                        <img
                          src={(item as File).thumbnail}
                          alt={item.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 bg-slate-900/60 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`h-10 w-10 rounded flex items-center justify-center ${
                        item.type === 'folder' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        item.type === 'image' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        item.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        item.type === 'audio' ? 'bg-green-100 dark:bg-green-900/30' :
                        item.type === '3d' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {getFileIcon(item.type)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {formatDate(item.updatedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {item.size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {item.type !== 'folder' && (
                    <button
                      className={`text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 ${
                        (item as File).favorite ? 'text-amber-500 dark:text-amber-400' : ''
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={(item as File).favorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  )}
                  <button className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render details view
  const renderDetailsView = () => {
    if (selectedItems.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">No Item Selected</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select an item to view its details
          </p>
        </div>
      );
    }

    const selectedItem = currentFiles.find(item => item.id === selectedItems[0]);
    
    if (!selectedItem) {
      return null;
    }

    return (
      <div className="p-6">
        <div className="mb-6 text-center">
          {selectedItem.type === 'image' && (selectedItem as File).thumbnail ? (
            <img
              src={(selectedItem as File).thumbnail}
              alt={selectedItem.name}
              className="w-40 h-40 mx-auto rounded object-cover"
            />
          ) : selectedItem.type === 'video' && (selectedItem as File).thumbnail ? (
            <div className="relative w-40 h-40 mx-auto">
              <img
                src={(selectedItem as File).thumbnail}
                alt={selectedItem.name}
                className="w-40 h-40 rounded object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-slate-900/60 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-32 h-32 mx-auto rounded-xl flex items-center justify-center ${
              selectedItem.type === 'folder' ? 'bg-amber-100 dark:bg-amber-900/30' :
              selectedItem.type === 'image' ? 'bg-blue-100 dark:bg-blue-900/30' :
              selectedItem.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30' :
              selectedItem.type === 'audio' ? 'bg-green-100 dark:bg-green-900/30' :
              selectedItem.type === '3d' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-slate-100 dark:bg-slate-700'
            }`}>
              <div className="w-16 h-16">
                {getFileIcon(selectedItem.type)}
              </div>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-4">
          {selectedItem.name}
        </h2>
        
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Type</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Size</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {selectedItem.size}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Last Modified</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {formatDate(selectedItem.updatedAt)}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Location</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {currentPath.length === 0 ? 'Home' : currentPath.map(f => f.name).join(' / ')}
            </span>
          </div>
          
          {selectedItem.type !== 'folder' && (
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Favorite</span>
              <button
                className={`text-sm font-medium ${
                  (selectedItem as File).favorite
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill={(selectedItem as File).favorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  {(selectedItem as File).favorite ? 'Favorited' : 'Add to Favorites'}
                </div>
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 space-y-4">
          <button className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md">
            {selectedItem.type === 'folder' ? 'Open Folder' : 'Open File'}
          </button>
          
          <button className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            {selectedItem.type === 'folder' ? 'Rename Folder' : 'Rename File'}
          </button>
          
          <button className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            Share
          </button>
          
          <button className="w-full py-2 px-4 border border-red-300 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Breadcrumb */}
            <div className="flex items-center">
              {currentPath.length > 0 && (
                <button
                  onClick={navigateUp}
                  className="mr-2 p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {renderBreadcrumb()}
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* View switcher */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-md flex">
                <button
                  onClick={() => dispatch(setActiveView('grid'))}
                  className={`p-2 ${
                    activeView === 'grid'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => dispatch(setActiveView('list'))}
                  className={`p-2 ${
                    activeView === 'list'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => dispatch(setActiveView('details'))}
                  className={`p-2 ${
                    activeView === 'details'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                </button>
              </div>
              
              {/* Type filter */}
              <select
                value={filterType || ''}
                onChange={(e) => setFilterType(e.target.value || null)}
                className="form-control h-10 py-2 px-3 text-sm"
              >
                <option value="">All Files</option>
                <option value="folder">Folders</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="3d">3D Models</option>
                <option value="favorite">Favorites</option>
              </select>
              
              {/* Upload button */}
              <button className="btn btn-primary h-10 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </button>
              
              {/* Create folder button */}
              <button className="btn btn-outline h-10 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                New Folder
              </button>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className={`flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900 ${
          activeView === 'details' ? 'lg:grid lg:grid-cols-3 lg:gap-6' : ''
        }`}>
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="loading loading-lg"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Files Found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {filterType
                    ? `No ${filterType} files found in this location.`
                    : 'This folder is empty.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button className="btn btn-primary flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Files
                  </button>
                  <button className="btn btn-outline flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Create Folder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={activeView === 'details' ? 'lg:col-span-2' : ''}>
                {activeView === 'grid' && renderGridView()}
                {activeView === 'list' && renderListView()}
                {activeView === 'details' && (activeView === 'details' && selectedItems.length === 0) && renderGridView()}
              </div>
              
              {activeView === 'details' && (
                <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  {renderDetailsView()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
