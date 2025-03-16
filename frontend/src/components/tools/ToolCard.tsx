import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AITool } from '../../store/api/apiSlice';

interface ToolCardProps {
  tool: AITool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  // Get appropriate icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return '/icons/image-icon.svg';
      case 'video':
        return '/icons/video-icon.svg';
      case 'audio':
        return '/icons/audio-icon.svg';
      case '3d':
        return '/icons/3d-icon.svg';
      case 'text':
        return '/icons/text-icon.svg';
      case 'multimodal':
        return '/icons/multimodal-icon.svg';
      default:
        return '/icons/unknown-icon.svg';
    }
  };

  return (
    <Link href={`/dashboard/tools/${tool.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 transform hover:scale-105 cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={tool.thumbnailUrl || getCategoryIcon(tool.category)}
            alt={tool.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {tool.pricing.creditCost} credits
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
              <Image
                src={getCategoryIcon(tool.category)}
                alt={tool.category}
                width={20}
                height={20}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 h-10 overflow-hidden">
            {tool.description.length > 75 ? tool.description.substring(0, 75) + '...' : tool.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Provider: {tool.provider}
            </span>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-xs">{tool.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ToolCard;
