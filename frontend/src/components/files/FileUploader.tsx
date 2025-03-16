import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useUploadFileMutation } from '@/store/api/storageApi';

interface FileUploaderProps {
  folderId?: string;
  onUploadComplete?: (files: { id: string; name: string; type: string }[]) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  folderId,
  onUploadComplete,
  allowedFileTypes,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  maxFiles = 10,
  className = '',
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uploadingFiles = useRef<File[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrorMessage(null);

      // Check if user is authenticated
      if (!user) {
        setErrorMessage('You must be logged in to upload files');
        return;
      }

      // Limit number of files
      if (acceptedFiles.length > maxFiles) {
        setErrorMessage(`You can only upload up to ${maxFiles} files at once`);
        return;
      }

      // Check file types if specified
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        const invalidFile = acceptedFiles.find(
          (file) => !allowedFileTypes.includes(file.type)
        );

        if (invalidFile) {
          setErrorMessage(
            `File type not allowed: ${invalidFile.type}. Allowed types: ${allowedFileTypes.join(
              ', '
            )}`
          );
          return;
        }
      }

      // Check file sizes
      const oversizedFile = acceptedFiles.find((file) => file.size > maxFileSize);
      if (oversizedFile) {
        setErrorMessage(
          `File too large: ${oversizedFile.name}. Maximum size: ${Math.floor(
            maxFileSize / (1024 * 1024)
          )}MB`
        );
        return;
      }

      uploadingFiles.current = acceptedFiles;

      // Track progress for all files
      const initialProgress: Record<string, number> = {};
      acceptedFiles.forEach((file) => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(initialProgress);

      // Upload files
      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          // In a real implementation, you'd use a multipart form request with progress tracking
          // For now, we'll simulate progress updates
          const simulateProgress = () => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 10;
              if (progress > 95) {
                clearInterval(interval);
                progress = 95; // We'll set it to 100% when the upload actually completes
              }
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: Math.min(Math.round(progress), 95),
              }));
            }, 300);
            return () => clearInterval(interval);
          };

          const cleanupProgress = simulateProgress();

          // Upload the file using the API
          const result = await uploadFile({
            file,
            parentId: folderId,
          }).unwrap();

          // Mark as complete
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 100,
          }));

          // Clean up the progress simulation
          cleanupProgress();

          return result;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: -1, // Error state
          }));
          setErrorMessage(`Failed to upload ${file.name}. Please try again.`);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);

      if (successfulUploads.length > 0 && onUploadComplete) {
        onUploadComplete(successfulUploads);
      }
    },
    [folderId, user, maxFiles, allowedFileTypes, maxFileSize, uploadFile, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles,
  });

  return (
    <div className={`${className}`}>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 transition ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
      >
        <input {...getInputProps()} />

        <div className="text-center">
          <div className="mx-auto flex justify-center">
            <svg
              className="w-12 h-12 text-slate-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
            {isDragActive ? (
              <span className="font-medium">Drop the files here</span>
            ) : (
              <>
                <span className="font-medium">Drag and drop files</span> or{' '}
                <button
                  type="button"
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none focus:underline"
                  onClick={open}
                >
                  browse
                </button>
              </>
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {allowedFileTypes
              ? `Allowed file types: ${allowedFileTypes.join(', ')}`
              : 'All file types accepted'}{' '}
            • Max size: {Math.floor(maxFileSize / (1024 * 1024))}MB • Max files: {maxFiles}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
            <span className="font-medium">Error:</span> {errorMessage}
          </div>
        )}

        {/* Upload progress indicators */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Uploading {Object.keys(uploadProgress).length} file(s)...
            </p>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mr-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      progress === -1
                        ? 'bg-red-500'
                        : progress === 100
                        ? 'bg-green-500'
                        : 'bg-primary-500'
                    }`}
                    style={{ width: `${progress === -1 ? 100 : progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-16">
                  {progress === -1
                    ? 'Failed'
                    : progress === 100
                    ? 'Complete'
                    : `${progress}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
