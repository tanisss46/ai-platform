import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import FolderList from './FolderList';
import FileList from './FileList';
import BreadcrumbNav from './BreadcrumbNav';
import FileBrowser from './FileBrowser';
import FileToolbar from './FileToolbar';
import FileDetails from './FileDetails';
import FilePreview from './FilePreview';
import FileUploader from './FileUploader';
import { useGetFoldersQuery, useGetContentQuery } from '../../store/api/storageApi';

export type ViewMode = 'list' | 'grid' | 'details';
export type SortBy = 'name' | 'dateCreated' | 'dateModified' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

const FileExplorer: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get the current folder ID from the URL query parameter
  const { folderId = 'root' } = router.query;
  
  // State for view preferences
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Fetch folders from API
  const { 
    data: folders = [],
    isLoading: isFoldersLoading,
    error: foldersError
  } = useGetFoldersQuery({ parentId: folderId });
  
  // Fetch files from API
  const {
    data: filesData,
    isLoading: isFilesLoading,
    error: filesError
  } = useGetContentQuery({ 
    parentFolderId: folderId, 
    sortBy, 
    sortDir: sortDirection
  });
  
  const files = filesData?.items || [];
  const isLoading = isFoldersLoading || isFilesLoading;
  const error = foldersError || filesError;
  
  // Handle folder navigation
  const handleFolderClick = (newFolderId: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, folderId: newFolderId },
    });
    
    // Clear selection when navigating
    setSelectedItems([]);
  };
  
  // Handle item selection
  const handleItemSelect = (id: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      // Multi-select (holding Ctrl/Cmd)
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id) 
          : [...prev, id]
      );
    } else {
      // Single select
      setSelectedItems(prev => 
        prev.length === 1 && prev[0] === id 
          ? [] 
          : [id]
      );
    }
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };
  
  // Handle sort options change
  const handleSortChange = (by: SortBy, direction: SortDirection) => {
    setSortBy(by);
    setSortDirection(direction);
  };
  
  // Handle upload complete
  const handleUploadComplete = () => {
    setIsUploading(false);
    // Refresh the current folder contents
  };
  
  // Reset selection when changing folders
  useEffect(() => {
    setSelectedItems([]);
  }, [folderId]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar with actions and view options */}
      <FileToolbar 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        selectedItems={selectedItems}
        onUploadClick={() => setIsUploading(true)}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
      />
      
      {/* Breadcrumb navigation */}
      <BreadcrumbNav 
        currentFolderId={folderId as string} 
        onNavigate={handleFolderClick} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with folder tree (conditionally shown) */}
        {showSidebar && (
          <div className="w-64 border-r border-gray-200 overflow-auto">
            <FolderList 
              currentFolderId={folderId as string}
              onFolderClick={handleFolderClick}
            />
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File browser in the chosen view mode */}
          <div className="flex-1 overflow-auto">
            <FileBrowser
              folders={folders}
              files={files}
              isLoading={isLoading}
              error={error ? (error as any).message : null}
              viewMode={viewMode}
              selectedItems={selectedItems}
              onFolderClick={handleFolderClick}
              onItemSelect={handleItemSelect}
            />
          </div>
          
          {/* Details panel (when items are selected) */}
          {selectedItems.length > 0 && (
            <div className="w-80 border-l border-gray-200 overflow-auto">
              <FileDetails selectedItems={selectedItems} />
            </div>
          )}
        </div>
      </div>
      
      {/* File uploader dialog */}
      {isUploading && (
        <FileUploader 
          currentFolderId={folderId as string}
          onClose={() => setIsUploading(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
      
      {/* Preview modal (when a file is opened) */}
      {/* This would be conditionally rendered when a file is opened */}
    </div>
  );
};

export default FileExplorer;