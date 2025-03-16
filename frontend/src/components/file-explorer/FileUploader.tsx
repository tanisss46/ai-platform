import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadFileMutation } from '../../store/api/storageApi';

interface FileUploaderProps {
  currentFolderId: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  currentFolderId,
  onClose,
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [uploadFile] = useUploadFileMutation();
  
  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });
  
  // Start upload process for all files
  const handleUpload = async () => {
    // Upload files one at a time
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      
      // Update file status to uploading
      setFiles(prev => 
        prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading' } : f
        )
      );
      
      try {
        // Prepare form data
        const formData = new FormData();
        formData.append('file', files[i].file);
        formData.append('folderId', currentFolderId === 'root' ? '' : currentFolderId);
        
        // Simulate progress updates while waiting for upload to complete
        const progressInterval = setInterval(() => {
          setFiles(prev => 
            prev.map((f, idx) => {
              if (idx === i && f.status === 'uploading' && f.progress < 90) {
                return { ...f, progress: Math.min(f.progress + 5, 90) };
              }
              return f;
            })
          );
        }, 300);
        
        // Execute the upload
        await uploadFile(formData).unwrap();
        
        // Clear interval and update status to success
        clearInterval(progressInterval);
        setFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { ...f, progress: 100, status: 'success' } : f
          )
        );
      } catch (error) {
        // Handle upload error
        setFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } : f
          )
        );
      }
    }
    
    // Notify parent component that uploads are complete
    onUploadComplete();
  };
  
  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Check if upload is in progress
  const isUploading = files.some(f => f.status === 'uploading');
  
  // Count upload statistics
  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    success: files.filter(f => f.status === 'success').length,
    error: files.filter(f => f.status === 'error').length,
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isUploading}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Drop zone */}
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag and drop files here, or click to select files'}
            </p>
          </div>
        </div>
        
        {/* File list */}
        {files.length > 0 && (
          <div className="px-6 pb-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h3>
            <div className="space-y-2">
              {files.map((fileUpload, index) => (
                <div
                  key={`${fileUpload.file.name}-${index}`}
                  className="flex items-center bg-gray-50 p-2 rounded-md"
                >
                  {/* File icon */}
                  <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  
                  {/* File details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileUpload.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileUpload.file.size / 1024).toFixed(1)} KB
                    </p>
                    
                    {/* Progress bar */}
                    {(fileUpload.status === 'uploading' || fileUpload.status === 'success') && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            fileUpload.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${fileUpload.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {fileUpload.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">
                        {fileUpload.error || 'Upload failed'}
                      </p>
                    )}
                  </div>
                  
                  {/* Status icon or remove button */}
                  {fileUpload.status === 'success' ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : fileUpload.status === 'error' ? (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : fileUpload.status === 'uploading' ? (
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer with actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          {/* Stats */}
          {files.length > 0 && (
            <div className="text-sm text-gray-500">
              {stats.total} file{stats.total !== 1 ? 's' : ''} selected
              {stats.success > 0 && `, ${stats.success} uploaded`}
              {stats.error > 0 && `, ${stats.error} failed`}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isUploading}
            >
              {stats.success === stats.total && stats.total > 0 ? 'Done' : 'Cancel'}
            </button>
            
            {stats.pending > 0 && (
              <button
                onClick={handleUpload}
                disabled={isUploading || stats.pending === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isUploading || stats.pending === 0
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;