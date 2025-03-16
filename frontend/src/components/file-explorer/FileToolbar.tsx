import React, { useState } from 'react';
import { ViewMode, SortBy, SortDirection } from './FileExplorer';

interface FileToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  sortDirection: SortDirection;
  onSortChange: (by: SortBy, direction: SortDirection) => void;
  selectedItems: string[];
  onUploadClick: () => void;
  onToggleSidebar: () => void;
}

const FileToolbar: React.FC<FileToolbarProps> = ({
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  selectedItems,
  onUploadClick,
  onToggleSidebar,
}) => {
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // Handle toggling sorting options dropdown
  const toggleSortOptions = () => {
    setShowSortOptions(prev => !prev);
  };
  
  // Handle changing sort order
  const handleSortOrderChange = () => {
    onSortChange(sortBy, sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle changing sort by
  const handleSortByChange = (by: SortBy) => {
    onSortChange(by, sortDirection);
    setShowSortOptions(false);
  };
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between">
      {/* Left side actions */}
      <div className="flex space-x-2">
        {/* New folder button */}
        <button
          className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          New Folder
        </button>
        
        {/* Upload button */}
        <button
          onClick={onUploadClick}
          className="flex items-center px-3 py-1.5 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload
        </button>
        
        {/* Selection-dependent actions */}
        {selectedItems.length > 0 && (
          <>
            {/* Delete button */}
            <button
              className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            
            {/* Move button */}
            <button
              className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Move
            </button>
            
            {/* Rename button (only if one item selected) */}
            {selectedItems.length === 1 && (
              <button
                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rename
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Right side view options */}
      <div className="flex items-center space-x-4">
        {/* Toggle sidebar button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
        
        {/* Sort options */}
        <div className="relative">
          <button
            onClick={toggleSortOptions}
            className="flex items-center p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Sort options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
          
          {/* Sort dropdown */}
          {showSortOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => handleSortByChange('name')}
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'name' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Name
                </button>
                <button
                  onClick={() => handleSortByChange('dateCreated')}
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'dateCreated' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Date Created
                </button>
                <button
                  onClick={() => handleSortByChange('dateModified')}
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'dateModified' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Date Modified
                </button>
                <button
                  onClick={() => handleSortByChange('size')}
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'size' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Size
                </button>
                <button
                  onClick={() => handleSortByChange('type')}
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'type' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Type
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleSortOrderChange}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {sortDirection === 'asc' ? 'Ascending Order' : 'Descending Order'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* View mode options */}
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {/* Grid view */}
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            title="Grid view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          
          {/* List view */}
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            title="List view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          
          {/* Details view */}
          <button
            onClick={() => onViewModeChange('details')}
            className={`p-1.5 ${viewMode === 'details' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            title="Details view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileToolbar;