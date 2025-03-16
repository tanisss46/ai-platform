import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useGetAIToolQuery, useCreateJobMutation, AITool } from '../../store/api/apiSlice';

interface ParamField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'slider';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  defaultValue?: any;
  required?: boolean;
}

// Sample parameter fields for different tool types
const getToolParams = (tool: AITool): ParamField[] => {
  switch (tool.category) {
    case 'image':
      return [
        {
          name: 'prompt',
          type: 'textarea',
          label: 'Prompt',
          placeholder: 'Describe the image you want to generate...',
          required: true,
        },
        {
          name: 'negative_prompt',
          type: 'textarea',
          label: 'Negative Prompt',
          placeholder: 'Elements you want to exclude...',
        },
        {
          name: 'width',
          type: 'number',
          label: 'Width',
          defaultValue: 1024,
          min: 512,
          max: 2048,
        },
        {
          name: 'height',
          type: 'number',
          label: 'Height',
          defaultValue: 1024,
          min: 512,
          max: 2048,
        },
        {
          name: 'style',
          type: 'select',
          label: 'Style',
          options: [
            { value: 'raw', label: 'Raw' },
            { value: 'realistic', label: 'Realistic' },
            { value: 'anime', label: 'Anime' },
            { value: 'fantasy', label: 'Fantasy' },
            { value: 'cinematic', label: 'Cinematic' },
          ],
          defaultValue: 'raw',
        },
      ];
    case 'video':
      return [
        {
          name: 'prompt',
          type: 'textarea',
          label: 'Prompt',
          placeholder: 'Describe the video you want to generate...',
          required: true,
        },
        {
          name: 'negative_prompt',
          type: 'textarea',
          label: 'Negative Prompt',
          placeholder: 'Elements you want to exclude...',
        },
        {
          name: 'durationInSeconds',
          type: 'number',
          label: 'Duration (seconds)',
          defaultValue: 5,
          min: 1,
          max: 30,
        },
        {
          name: 'fps',
          type: 'number',
          label: 'FPS',
          defaultValue: 30,
          min: 15,
          max: 60,
        },
        {
          name: 'resolution',
          type: 'select',
          label: 'Resolution',
          options: [
            { value: '720p', label: '720p' },
            { value: '1080p', label: '1080p' },
            { value: '1440p', label: '1440p' },
          ],
          defaultValue: '1080p',
        },
      ];
    case 'audio':
      return [
        {
          name: 'prompt',
          type: 'textarea',
          label: 'Prompt',
          placeholder: 'Describe the audio you want to generate...',
          required: true,
        },
        {
          name: 'durationInSeconds',
          type: 'number',
          label: 'Duration (seconds)',
          defaultValue: 10,
          min: 1,
          max: 60,
        },
        {
          name: 'quality',
          type: 'select',
          label: 'Quality',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'high', label: 'High' },
          ],
          defaultValue: 'high',
        },
      ];
    default:
      return [
        {
          name: 'prompt',
          type: 'textarea',
          label: 'Prompt',
          placeholder: 'Enter your prompt...',
          required: true,
        },
      ];
  }
};

const ToolDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tool, isLoading, error } = useGetAIToolQuery(id as string);
  const [createJob, { isLoading: isCreatingJob }] = useCreateJobMutation();
  
  // Form state
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 w-1/3 rounded animate-pulse mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading tool details. Please try again later.</p>
      </div>
    );
  }

  const paramFields = getToolParams(tool);

  const handleInputChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    paramFields.forEach(field => {
      if (field.required && !formState[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare parameters with default values
      const parameters = { ...formState };
      
      // Set default values for any fields not provided
      paramFields.forEach(field => {
        if (parameters[field.name] === undefined && field.defaultValue !== undefined) {
          parameters[field.name] = field.defaultValue;
        }
      });
      
      // Create job
      const result = await createJob({
        modelId: tool.id,
        parameters,
      }).unwrap();
      
      // Redirect to job status page
      router.push(`/dashboard/jobs/${result.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      // TODO: Show error toast or notification
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Tool Header */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image 
              src={tool.thumbnailUrl || `/icons/${tool.category}-icon.svg`}
              alt={tool.name}
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-4 left-6 text-white">
            <div className="flex items-center">
              <span className="bg-gray-800 bg-opacity-70 text-sm px-2 py-1 rounded mr-2">
                {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
              </span>
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-sm">{tool.rating.toFixed(1)}</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-1">{tool.name}</h1>
            <p className="text-sm opacity-90 mt-1">by {tool.provider}</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tool Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About this tool</h2>
              <p className="text-gray-700 dark:text-gray-300">{tool.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Capabilities</h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                {tool.capabilities.map((capability, index) => (
                  <li key={index} className="mb-1">{capability}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pricing</h3>
              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Cost per use:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">
                    {tool.pricing.creditCost} credits
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-700 dark:text-gray-300">Pricing model:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {tool.pricing.pricingModel}
                    {tool.pricing.unitType ? ` per ${tool.pricing.unitType}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tool Parameters Form */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generate with {tool.name}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {paramFields.map((field) => (
                <div key={field.name} className="mb-4">
                  <label 
                    htmlFor={field.name} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      id={field.name}
                      placeholder={field.placeholder}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formState[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formState[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      id={field.name}
                      min={field.min}
                      max={field.max}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formState[field.name] || field.defaultValue || ''}
                      onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                    />
                  )}
                  
                  {field.type === 'select' && field.options && (
                    <select
                      id={field.name}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formState[field.name] || field.defaultValue || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {/* Display validation error if exists */}
                  {formErrors[field.name] && (
                    <p className="mt-1 text-sm text-red-500">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isCreatingJob}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 disabled:bg-blue-400"
                >
                  {isCreatingJob ? 'Generating...' : `Generate with ${tool.name} (${tool.pricing.creditCost} credits)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;
