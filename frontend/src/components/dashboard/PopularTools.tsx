import React from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'image' | 'video' | 'audio' | '3d' | 'text' | 'multimodal';
  icon: string;
  popularityScore: number;
  credits: number;
}

const PopularTools: React.FC = () => {
  // Mock data
  const tools: Tool[] = [
    {
      id: '1',
      name: 'Midjourney',
      description: 'Create beautiful images from text prompts with advanced AI.',
      category: 'image',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzE5MjAzRSIvPjxwYXRoIGQ9Ik0zMyA2NVYzNUw1MCAxOS41TDY3IDM1VjY1TDUwIDgwLjVMMzMgNjVaIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNSIvPjwvc3ZnPg==',
      popularityScore: 98,
      credits: 5,
    },
    {
      id: '2',
      name: 'Stable Diffusion',
      description: 'Generate high-quality images with an open-source model.',
      category: 'image',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzY5MkU3MSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUiIGZpbGw9IiNGRkYiLz48L3N2Zz4=',
      popularityScore: 92,
      credits: 3,
    },
    {
      id: '3',
      name: 'Kling AI',
      description: 'Create professional videos from text in minutes.',
      category: 'video',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzQ4NEJCQyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00NSA0MEw2MCA1MEw0NSA2MFY0MFoiIGZpbGw9IiM0ODRCQkMiLz48L3N2Zz4=',
      popularityScore: 87,
      credits: 8,
    },
    {
      id: '4',
      name: 'MMAudio',
      description: 'Generate realistic music and sound effects with AI.',
      category: 'audio',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzJBOUM2OCIvPjxwYXRoIGQ9Ik0zMCA1MEg0MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNDUgMzVINTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1IDUwSDU1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00NSA2NUg1NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNjAgNTBINzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
      popularityScore: 84,
      credits: 4,
    },
    {
      id: '5',
      name: 'Claude AI',
      description: 'Advanced language model for text and content generation.',
      category: 'text',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzQyODVGNCIvPjxwYXRoIGQ9Ik0zMCAzMEg3MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzAgNTBINzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTMwIDcwSDUwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
      popularityScore: 90,
      credits: 2,
    },
    {
      id: '6',
      name: 'Shape-E',
      description: '3D model generation from natural language descriptions.',
      category: '3d',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iI0ZGOTUwMCIvPjxwYXRoIGQ9Ik0zMCA1MEw1MCAzMEw3MCA1MEw1MCA3MEwzMCA1MFoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAzMFY3MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTMwIDUwSDcwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
      popularityScore: 79,
      credits: 7,
    },
  ];

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'video':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'audio':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case '3d':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'text':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'multimodal':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Popular AI Tools</h3>
        <Link href="/dashboard/tools" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          Explore All
        </Link>
      </div>
      
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="relative bg-slate-50 dark:bg-slate-700/25 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="p-4 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {tool.name}
                  </h4>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {tool.credits} credits
                  </span>
                </div>
                
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tool.description}
                </p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(tool.category)}`}>
                    {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                  </span>
                  
                  <Link
                    href={`/dashboard/tools/${tool.id}`}
                    className="inline-flex items-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    Use Tool
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularTools;
