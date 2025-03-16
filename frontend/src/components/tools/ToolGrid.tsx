import React from 'react';
import { useGetAIToolsQuery } from '../../store/api/apiSlice';
import ToolCard from './ToolCard';

interface ToolGridProps {
  category?: string;
  searchQuery?: string;
}

const ToolGrid: React.FC<ToolGridProps> = ({ category, searchQuery }) => {
  const { data: tools, isLoading, error } = useGetAIToolsQuery({ category });

  // Filter tools based on search query if provided
  const filteredTools = searchQuery && tools
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tools;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-72 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading AI tools. Please try again later.</p>
      </div>
    );
  }

  if (!filteredTools || filteredTools.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery ? 'No tools match your search criteria.' : 'No AI tools available in this category.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {filteredTools.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};

export default ToolGrid;
