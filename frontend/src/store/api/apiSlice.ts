import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// Types for API responses
export interface User {
  id: string;
  email: string;
  displayName: string;
  accountType: string;
  credits: number;
  profilePicture?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  path: string[];
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | '3d' | 'document';
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  thumbnailUrl?: string;
  url: string;
  parentFolderId?: string;
  path: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AITool {
  id: string;
  name: string;
  provider: string;
  category: 'image' | 'video' | 'audio' | '3d' | 'text' | 'multimodal';
  description: string;
  capabilities: string[];
  pricing: {
    creditCost: number;
    pricingModel: string;
    unitType?: string;
  };
  thumbnailUrl: string;
  popularity: number;
  rating: number;
}

export interface Job {
  id: string;
  userId: string;
  modelId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  parameters: Record<string, any>;
  inputContentIds: string[];
  outputContentIds: string[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  modelId: string;
  parameters: Record<string, any>;
  inputContentIds?: string[];
}

export interface LLMCommandRequest {
  command: string;
}

export interface LLMCommandResponse {
  thinking?: string;
  response?: string;
  jobId?: string;
  currentStep?: string;
  workflowId?: string;
  error?: string;
}

export interface WorkflowStep {
  id: string;
  modelId: string;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  inputContentIds: string[];
  outputContentIds: string[];
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the current state
      const token = (getState() as RootState).auth.token;
      
      // If we have a token, include it in the request
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Files', 'Folders', 'AITools', 'Jobs', 'Workflows'],
  endpoints: (builder) => ({
    // User endpoints
    getCurrentUser: builder.query<User, void>({
      query: () => 'users/me',
      providesTags: ['User'],
    }),
    
    // Folders endpoints
    getFolders: builder.query<Folder[], void>({
      query: () => 'storage/folders',
      providesTags: ['Folders'],
    }),
    getFolder: builder.query<Folder, string>({
      query: (id) => `storage/folders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Folders', id }],
    }),
    createFolder: builder.mutation<Folder, Partial<Folder>>({
      query: (folder) => ({
        url: 'storage/folders',
        method: 'POST',
        body: folder,
      }),
      invalidatesTags: ['Folders'],
    }),
    
    // Files endpoints
    getFiles: builder.query<ContentFile[], { folderId?: string }>({
      query: ({ folderId }) => folderId 
        ? `storage/content?folderId=${folderId}` 
        : 'storage/content',
      providesTags: ['Files'],
    }),
    getFile: builder.query<ContentFile, string>({
      query: (id) => `storage/content/${id}`,
      providesTags: (result, error, id) => [{ type: 'Files', id }],
    }),
    uploadFile: builder.mutation<ContentFile, FormData>({
      query: (formData) => ({
        url: 'storage/files/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Files'],
    }),
    
    // AI Tools endpoints
    getAITools: builder.query<AITool[], { category?: string }>({
      query: ({ category }) => category 
        ? `ai-orchestration/tools?category=${category}` 
        : 'ai-orchestration/tools',
      providesTags: ['AITools'],
    }),
    getAITool: builder.query<AITool, string>({
      query: (id) => `ai-orchestration/tools/${id}`,
      providesTags: (result, error, id) => [{ type: 'AITools', id }],
    }),
    
    // Jobs endpoints
    getJobs: builder.query<Job[], void>({
      query: () => 'ai-orchestration/jobs',
      providesTags: ['Jobs'],
    }),
    getJob: builder.query<Job, string>({
      query: (id) => `ai-orchestration/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Jobs', id }],
    }),
    createJob: builder.mutation<Job, CreateJobRequest>({
      query: (jobRequest) => ({
        url: 'ai-orchestration/jobs',
        method: 'POST',
        body: jobRequest,
      }),
      invalidatesTags: ['Jobs'],
    }),
    
    // LLM Assistant endpoints
    createLlmCommand: builder.mutation<LLMCommandResponse, LLMCommandRequest>({
      query: (commandRequest) => ({
        url: 'llm-assistant/command',
        method: 'POST',
        body: commandRequest,
      }),
    }),
    
    // Workflow endpoints
    getWorkflows: builder.query<Workflow[], void>({
      query: () => 'ai-orchestration/workflows',
      providesTags: ['Workflows'],
    }),
    getWorkflow: builder.query<Workflow, string>({
      query: (id) => `ai-orchestration/workflows/${id}`,
      providesTags: (result, error, id) => [{ type: 'Workflows', id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCurrentUserQuery,
  useGetFoldersQuery,
  useGetFolderQuery,
  useCreateFolderMutation,
  useGetFilesQuery,
  useGetFileQuery,
  useUploadFileMutation,
  useGetAIToolsQuery,
  useGetAIToolQuery,
  useGetJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useCreateLlmCommandMutation,
  useGetWorkflowsQuery,
  useGetWorkflowQuery,
} = api;
