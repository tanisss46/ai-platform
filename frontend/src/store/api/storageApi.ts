import { apiSlice } from './apiSlice';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageContent {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

export interface FileContent {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  parentId: string | null;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export const storageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContent: builder.query<StorageContent[], string>({
      query: (folderId = 'root') => `/storage/content/${folderId}`,
      providesTags: ['StorageContents'],
    }),
    
    getFolders: builder.query<Folder[], void>({
      query: () => '/storage/folders',
      providesTags: ['Folders'],
    }),
    
    getFolderPath: builder.query<Folder[], string>({
      query: (folderId) => `/storage/folders/path/${folderId}`,
    }),
    
    getFile: builder.query<FileContent, string>({
      query: (fileId) => `/storage/files/${fileId}`,
      providesTags: (result, error, id) => [{ type: 'File', id }],
    }),
    
    createFolder: builder.mutation<Folder, { name: string; parentId?: string }>({
      query: (body) => ({
        url: '/storage/folders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Folders', 'StorageContents'],
    }),
    
    uploadFile: builder.mutation<FileContent, { file: File; parentId?: string }>({
      query: ({ file, parentId }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (parentId) {
          formData.append('parentId', parentId);
        }
        
        return {
          url: '/storage/files/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['StorageContents'],
    }),
    
    renameContent: builder.mutation<
      { id: string; name: string },
      { id: string; name: string; type: 'file' | 'folder' }
    >({
      query: ({ id, name, type }) => ({
        url: `/storage/${type === 'folder' ? 'folders' : 'files'}/${id}/rename`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: ['StorageContents', 'Folders'],
    }),
    
    moveContent: builder.mutation<
      { id: string; parentId: string },
      { id: string; parentId: string; type: 'file' | 'folder' }
    >({
      query: ({ id, parentId, type }) => ({
        url: `/storage/${type === 'folder' ? 'folders' : 'files'}/${id}/move`,
        method: 'PATCH',
        body: { parentId },
      }),
      invalidatesTags: ['StorageContents', 'Folders'],
    }),
    
    deleteContent: builder.mutation<
      { id: string },
      { id: string; type: 'file' | 'folder' }
    >({
      query: ({ id, type }) => ({
        url: `/storage/${type === 'folder' ? 'folders' : 'files'}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StorageContents', 'Folders'],
    }),
  }),
});

export const {
  useGetContentQuery,
  useGetFoldersQuery,
  useGetFolderPathQuery,
  useGetFileQuery,
  useCreateFolderMutation,
  useUploadFileMutation,
  useRenameContentMutation,
  useMoveContentMutation,
  useDeleteContentMutation,
} = storageApi;
