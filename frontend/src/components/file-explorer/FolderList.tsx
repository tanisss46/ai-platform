import React, { useState, useEffect } from 'react';
import { useGetFoldersQuery } from '../../store/api/storageApi';

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  childCount: number;
}

interface FolderListProps {
  currentFolderId: string;
  onFolderClick: (folderId: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({ currentFolderId, onFolderClick }) => {
  // Track expanded folder IDs
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  
  // Fetch root folders (those without a parent)
  const { 
    data: rootFolders = [], 
    isLoading: isRootLoading 
  } = useGetFoldersQuery({ parentId: null });
  
  // Prepare the folder tree for display
  // This would get more sophisticated with a proper recursive approach
  // For MVP, we'll simplify and assume a 2-level hierarchy
  
  // Expand the parent of the current folder when it changes
  useEffect(() => {
    if (currentFolderId !== 'root') {
      // Find the current folder
      const currentFolder = rootFolders.find(f => f.id === currentFolderId);
      
      // If it has a parent, expand that parent
      if (currentFolder?.parentId) {
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          newSet.add(currentFolder.parentId as string);
          return newSet;
        });
      }
    }
  }, [currentFolderId, rootFolders]);
  
  // Toggle folder expansion
  const toggleFolderExpansion = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };
  
  const renderFolderItem = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = folder.id === currentFolderId;
    const hasChildren = folder.childCount > 0;
    
    return (
      <div key={folder.id} className="relative">
        <div
          className={`
            flex items-center py-2 px-3 cursor-pointer
            ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
            ${depth > 0 ? 'pl-' + (depth * 4 + 3) : ''}
          `}
          onClick={() => onFolderClick(folder.id)}
        >
          {/* Folder toggle button (only if it has children) */}
          {hasChildren && (
            <button
              className="mr-1 w-4 h-4 flex items-center justify-center"
              onClick={(e) => toggleFolderExpansion(folder.id, e)}
            >
              <svg
                className={`w-3 h-3 transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          
          {/* Folder icon */}
          <svg
            className="w-5 h-5 mr-2 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
              clipRule="evenodd"
            />
            <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
          </svg>
          
          {/* Folder name */}
          <span className="truncate">{folder.name}</span>
          
          {/* Child count */}
          {folder.childCount > 0 && (
            <span className="ml-2 text-xs text-gray-500">{folder.childCount}</span>
          )}
        </div>
        
        {/* Render child folders if expanded */}
        {isExpanded && hasChildren && (
          <ChildFolders
            parentId={folder.id}
            currentFolderId={currentFolderId}
            depth={depth + 1}
            onFolderClick={onFolderClick}
            onToggleExpansion={toggleFolderExpansion}
            expandedFolders={expandedFolders}
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="py-2">
      {/* Root folder */}
      <div
        className={`
          flex items-center py-2 px-3 cursor-pointer
          ${currentFolderId === 'root' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
        `}
        onClick={() => onFolderClick('root')}
      >
        <svg
          className="w-5 h-5 mr-2 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span>Home</span>
      </div>
      
      {/* Root level folders */}
      {isRootLoading ? (
        <div className="p-3 text-gray-500">Loading folders...</div>
      ) : (
        rootFolders.map(folder => renderFolderItem(folder))
      )}
    </div>
  );
};

// Component to render child folders with data fetching
const ChildFolders: React.FC<{
  parentId: string;
  currentFolderId: string;
  depth: number;
  onFolderClick: (folderId: string) => void;
  onToggleExpansion: (folderId: string, e: React.MouseEvent) => void;
  expandedFolders: Set<string>;
}> = ({
  parentId,
  currentFolderId,
  depth,
  onFolderClick,
  onToggleExpansion,
  expandedFolders,
}) => {
  // Fetch child folders
  const { 
    data: childFolders = [], 
    isLoading 
  } = useGetFoldersQuery({ parentId });
  
  if (isLoading) {
    return <div className="pl-8 py-1 text-sm text-gray-500">Loading...</div>;
  }
  
  if (childFolders.length === 0) {
    return <div className="pl-8 py-1 text-sm text-gray-500">No subfolders</div>;
  }
  
  return (
    <div>
      {childFolders.map(folder => {
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = folder.id === currentFolderId;
        const hasChildren = folder.childCount > 0;
        
        return (
          <div key={folder.id} className="relative">
            <div
              className={`
                flex items-center py-2 px-3 cursor-pointer
                ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                pl-${depth * 4 + 3}
              `}
              onClick={() => onFolderClick(folder.id)}
            >
              {/* Folder toggle button (only if it has children) */}
              {hasChildren && (
                <button
                  className="mr-1 w-4 h-4 flex items-center justify-center"
                  onClick={(e) => onToggleExpansion(folder.id, e)}
                >
                  <svg
                    className={`w-3 h-3 transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              
              {/* Folder icon */}
              <svg
                className="w-5 h-5 mr-2 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                  clipRule="evenodd"
                />
                <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
              </svg>
              
              {/* Folder name */}
              <span className="truncate">{folder.name}</span>
              
              {/* Child count */}
              {folder.childCount > 0 && (
                <span className="ml-2 text-xs text-gray-500">{folder.childCount}</span>
              )}
            </div>
            
            {/* Render deeper child folders if expanded */}
            {isExpanded && hasChildren && (
              <ChildFolders
                parentId={folder.id}
                currentFolderId={currentFolderId}
                depth={depth + 1}
                onFolderClick={onFolderClick}
                onToggleExpansion={onToggleExpansion}
                expandedFolders={expandedFolders}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FolderList;