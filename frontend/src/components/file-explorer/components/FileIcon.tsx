import React from 'react';

interface FileIconProps {
  type: string;
  mimeType?: string;
  size?: number;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ 
  type, 
  mimeType = '',
  size = 40,
  className = ''
}) => {
  const getIconByType = (): string => {
    // Content type icons
    switch (type) {
      case 'folder':
        return '/icons/folder.svg';
      case 'image':
        return '/icons/image.svg';
      case 'video':
        return '/icons/video.svg';
      case 'audio':
        return '/icons/audio.svg';
      case '3d':
        return '/icons/3d.svg';
      case 'document':
        return '/icons/document.svg';
      default:
        // If type is not recognized, try to determine from mime type
        if (mimeType.startsWith('image/')) {
          return '/icons/image.svg';
        } else if (mimeType.startsWith('video/')) {
          return '/icons/video.svg';
        } else if (mimeType.startsWith('audio/')) {
          return '/icons/audio.svg';
        } else if (mimeType.includes('pdf')) {
          return '/icons/pdf.svg';
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
          return '/icons/word.svg';
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
          return '/icons/excel.svg';
        } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
          return '/icons/powerpoint.svg';
        } else if (mimeType.includes('text/')) {
          return '/icons/text.svg';
        } else if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('css') || mimeType.includes('html')) {
          return '/icons/code.svg';
        } else {
          return '/icons/file.svg';
        }
    }
  };

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={getIconByType()} 
        alt={`${type} icon`} 
        className="w-full h-full object-contain" 
      />
    </div>
  );
};

export default FileIcon;
