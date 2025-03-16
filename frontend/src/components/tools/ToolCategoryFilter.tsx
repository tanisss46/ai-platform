import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All Tools', icon: '/icons/all-tools-icon.svg' },
  { id: 'image', name: 'Image Generation', icon: '/icons/image-icon.svg' },
  { id: 'video', name: 'Video Creation', icon: '/icons/video-icon.svg' },
  { id: 'audio', name: 'Audio Generation', icon: '/icons/audio-icon.svg' },
  { id: '3d', name: '3D Models', icon: '/icons/3d-icon.svg' },
  { id: 'text', name: 'Text & Code', icon: '/icons/text-icon.svg' },
  { id: 'multimodal', name: 'Multimodal', icon: '/icons/multimodal-icon.svg' },
];

const ToolCategoryFilter: React.FC = () => {
  const router = useRouter();
  const activeCategory = router.query.category as string || 'all';

  return (
    <div className="flex overflow-x-auto py-4 px-6 bg-white dark:bg-gray-800 shadow-sm mb-4">
      <div className="flex space-x-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          
          return (
            <Link 
              key={category.id} 
              href={`/dashboard/tools${category.id === 'all' ? '' : `?category=${category.id}`}`}
            >
              <div 
                className={`
                  flex items-center px-4 py-2 rounded-full cursor-pointer whitespace-nowrap transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
                `}
              >
                <Image 
                  src={category.icon} 
                  alt={category.name} 
                  width={16} 
                  height={16} 
                  className="mr-2"
                />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ToolCategoryFilter;
