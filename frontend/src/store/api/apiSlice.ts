import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a base URL for all API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create an API slice with the RTK Query createApi function
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from localStorage if we're in a browser environment
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // If we have a token, add it to the request headers
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'StorageContents', 'Folders', 'File', 'Jobs', 'Tools'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    // User endpoints
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Health check
    healthCheck: builder.query({
      query: () => '/health',
    }),
    
    // Job endpoints
    getJobs: builder.query({
      query: (params) => ({
        url: '/jobs',
        params,
      }),
      providesTags: ['Jobs'],
    }),
    
    getJob: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Jobs', id }],
    }),
    
    createJob: builder.mutation({
      query: (jobData) => ({
        url: '/jobs',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: ['Jobs'],
    }),
    
    cancelJob: builder.mutation({
      query: (id) => ({
        url: `/jobs/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Jobs'],
    }),
    
    // LLM Command endpoint
    createLlmCommand: builder.mutation({
      query: (commandData) => ({
        url: '/llm/command',
        method: 'POST',
        body: commandData,
      }),
      invalidatesTags: ['Jobs'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useHealthCheckQuery,
  useGetJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useCancelJobMutation,
  useCreateLlmCommandMutation,
} = apiSlice;
