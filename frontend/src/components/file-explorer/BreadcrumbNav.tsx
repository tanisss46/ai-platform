import React, { useState, useEffect } from 'react';
import { useGetFolderPathQuery } from '../../store/api/storageApi';

interface Breadcrumb {
  id: string;
  name: string;
}

interface BreadcrumbNavProps {
  currentFolderId: string;
  onNavigate: (folderId: string) => void;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ currentFolderId, onNavigate }) => {
  // Skip API call if we're at the root folder
  const skipQuery = currentFolderId === 'root';
  
  // Fetch the breadcrumb path for the current folder
  const { 
    data: breadcrumbPath = [],
    isLoading,
    error
  } = useGetFolderPathQuery(
    { folderId: currentFolderId },
    { skip: skipQuery }
  );
  
  // Prepare a local breadcrumb for root folder
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    { id: 'root', name: 'Home' }
  ]);
  
  // Update breadcrumbs when the API data changes
  useEffect(() => {
    if (skipQuery) {
      setBreadcrumbs([{ id: 'root', name: 'Home' }]);
    } else if (breadcrumbPath && breadcrumbPath.length > 0) {
      setBreadcrumbs(breadcrumbPath);
    }
  }, [breadcrumbPath, skipQuery]);
  
  return (
    <nav className="py-3 px-4 flex items-center space-x-1 text-sm">
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading path</div>
      ) : (
        breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <button
              onClick={() => onNavigate(crumb.id)}
              className={`px-1.5 py-1 rounded-md ${
                crumb.id === currentFolderId
                  ? 'font-medium text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))
      )}
    </nav>
  );
};

export default BreadcrumbNav;