import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { StorageProviderService } from '../storage-provider/storage-provider.service';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as pdfPoppler from 'pdf-poppler';

const execPromise = promisify(exec);

@Injectable()
export class ThumbnailService implements OnModuleInit {
  private readonly logger = new Logger(ThumbnailService.name);
  private readonly supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  private readonly supportedDocumentTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation'
  ];
  private readonly supportedVideoTypes = [
    'video/mp4', 
    'video/quicktime', 
    'video/x-msvideo', 
    'video/webm',
    'video/mpeg',
    'video/ogg',
    'video/3gpp'
  ];
  
  private ffmpegAvailable = false;
  private popplerAvailable = false;
  private libreOfficeAvailable = false;
  
  constructor(
    private readonly storageProviderService: StorageProviderService,
    private readonly configService: ConfigService,
  ) {}
  
  /**
   * Check for required dependencies on module initialization
   */
  async onModuleInit() {
    try {
      await execPromise('ffmpeg -version');
      this.ffmpegAvailable = true;
      this.logger.log('FFmpeg is available for video thumbnail generation');
    } catch (error) {
      this.logger.warn('FFmpeg is not available. Video thumbnails will use generic icons.');
    }
    
    try {
      await execPromise('pdftoppm -v');
      this.popplerAvailable = true;
      this.logger.log('Poppler utils available for PDF thumbnail generation');
    } catch (error) {
      this.logger.warn('Poppler utils not available. PDF thumbnails will use generic icons.');
    }
    
    try {
      await execPromise('libreoffice --version');
      this.libreOfficeAvailable = true;
      this.logger.log('LibreOffice available for document thumbnail generation');
    } catch (error) {
      this.logger.warn('LibreOffice not available. Document thumbnails will use generic icons.');
    }
  }

  /**
   * Create thumbnail for a file
   */
  async createThumbnail(
    buffer: Buffer,
    mimeType: string,
    fileExtension: string,
    userId: string,
    fileName?: string,
  ): Promise<{ key: string; url: string }> {
    try {
      let thumbnailBuffer: Buffer;

      // Process based on file type
      if (this.supportedImageTypes.includes(mimeType)) {
        thumbnailBuffer = await this.createImageThumbnail(buffer);
      } else if (mimeType === 'application/pdf' && this.popplerAvailable) {
        thumbnailBuffer = await this.createPdfThumbnail(buffer, fileName || `temp_${uuidv4()}.pdf`);
      } else if (this.supportedDocumentTypes.includes(mimeType) && this.libreOfficeAvailable) {
        thumbnailBuffer = await this.createOfficeDocumentThumbnail(buffer, mimeType, fileName || `temp_${uuidv4()}${fileExtension}`);
      } else if (this.supportedVideoTypes.includes(mimeType) && this.ffmpegAvailable) {
        thumbnailBuffer = await this.createVideoThumbnail(buffer, fileName || `temp_${uuidv4()}${fileExtension}`);
      } else {
        // Generic icon for unsupported file types
        thumbnailBuffer = await this.createGenericThumbnail(fileExtension);
      }

      // Generate a unique thumbnail name
      const thumbnailName = `thumb_${uuidv4()}.webp`;
      
      // Upload the thumbnail to storage
      const result = await this.storageProviderService.uploadFile(
        thumbnailBuffer,
        'image/webp',
        thumbnailName,
        userId,
        { thumbnailFor: fileExtension },
      );

      return {
        key: result.key,
        url: result.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create thumbnail: ${error.message}`, error.stack);
      // Return fallback thumbnail path
      return this.getFallbackThumbnail(fileExtension);
    }
  }

  /**
   * Create thumbnail for image files
   */
  private async createImageThumbnail(buffer: Buffer): Promise<Buffer> {
    const thumbnailSize = this.configService.get<number>('THUMBNAIL_SIZE', 300);
    
    try {
      return await sharp(buffer)
        .resize(thumbnailSize, thumbnailSize, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      this.logger.error(`Failed to create image thumbnail: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create thumbnail for PDF using pdf-poppler
   */
  private async createPdfThumbnail(buffer: Buffer, fileName: string): Promise<Buffer> {
    const thumbnailSize = this.configService.get<number>('THUMBNAIL_SIZE', 300);
    const tempDir = path.join(os.tmpdir(), 'aicloud-thumbnails');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const pdfPath = path.join(tempDir, fileName);
    const outputPath = path.join(tempDir, `${path.basename(fileName, '.pdf')}`);
    
    try {
      // Write buffer to temporary file
      fs.writeFileSync(pdfPath, buffer);
      
      // Set options for pdf conversion
      const options = {
        format: 'jpeg',
        out_dir: tempDir,
        out_prefix: path.basename(fileName, '.pdf'),
        page: 1,
        scale: 2.0,
      };
      
      // Convert first page of PDF to image
      await pdfPoppler.convert(pdfPath, options);
      
      // Read the generated image
      const outputFileName = `${path.basename(fileName, '.pdf')}-1.jpg`;
      const outputFilePath = path.join(tempDir, outputFileName);
      
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('PDF conversion failed, no output file generated');
      }
      
      const imageBuffer = fs.readFileSync(outputFilePath);
      
      // Resize to thumbnail size and convert to webp
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(thumbnailSize, thumbnailSize, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
        
      // Clean up temporary files
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(outputFilePath);
      
      return thumbnailBuffer;
    } catch (error) {
      this.logger.error(`Failed to create PDF thumbnail: ${error.message}`, error.stack);
      // Clean up temporary files
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      throw error;
    }
  }

  /**
   * Create thumbnail for Office documents using LibreOffice
   */
  private async createOfficeDocumentThumbnail(buffer: Buffer, mimeType: string, fileName: string): Promise<Buffer> {
    const tempDir = path.join(os.tmpdir(), 'aicloud-thumbnails');
    const thumbnailSize = this.configService.get<number>('THUMBNAIL_SIZE', 300);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, fileName);
    
    try {
      // Write buffer to temporary file
      fs.writeFileSync(filePath, buffer);
      
      // Convert to PDF using LibreOffice
      await execPromise(`libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${filePath}"`);
      
      const pdfFileName = `${path.basename(fileName, path.extname(fileName))}.pdf`;
      const pdfFilePath = path.join(tempDir, pdfFileName);
      
      if (!fs.existsSync(pdfFilePath)) {
        throw new Error('Document conversion failed, no PDF file generated');
      }
      
      // Now create thumbnail from the PDF
      const pdfBuffer = fs.readFileSync(pdfFilePath);
      const thumbnailBuffer = await this.createPdfThumbnail(pdfBuffer, pdfFileName);
      
      // Clean up temporary files
      fs.unlinkSync(filePath);
      fs.unlinkSync(pdfFilePath);
      
      return thumbnailBuffer;
    } catch (error) {
      this.logger.error(`Failed to create document thumbnail: ${error.message}`, error.stack);
      // Clean up temporary files
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      // Fall back to generic thumbnail
      return this.createGenericThumbnail(path.extname(fileName));
    }
  }

  /**
   * Create thumbnail for video files
   */
  private async createVideoThumbnail(buffer: Buffer, fileName: string): Promise<Buffer> {
    const tempDir = path.join(os.tmpdir(), 'aicloud-thumbnails');
    const thumbnailSize = this.configService.get<number>('THUMBNAIL_SIZE', 300);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const videoPath = path.join(tempDir, fileName);
    const outputPath = path.join(tempDir, `${path.basename(fileName, path.extname(fileName))}.jpg`);
    
    try {
      // Write buffer to temporary file
      fs.writeFileSync(videoPath, buffer);
      
      // Extract a frame at 10% duration of the video
      await execPromise(`ffmpeg -i "${videoPath}" -ss 00:00:01 -frames:v 1 -vf "scale=${thumbnailSize}:${thumbnailSize}:force_original_aspect_ratio=decrease" "${outputPath}"`);
      
      if (!fs.existsSync(outputPath)) {
        throw new Error('Video frame extraction failed, no output file generated');
      }
      
      const imageBuffer = fs.readFileSync(outputPath);
      
      // Convert to webp
      const thumbnailBuffer = await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toBuffer();
        
      // Clean up temporary files
      fs.unlinkSync(videoPath);
      fs.unlinkSync(outputPath);
      
      return thumbnailBuffer;
    } catch (error) {
      this.logger.error(`Failed to create video thumbnail: ${error.message}`, error.stack);
      // Clean up temporary files
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      throw error;
    }
  }

  /**
   * Create a generic icon-based thumbnail for unsupported file types
   */
  private async createGenericThumbnail(fileExtension: string): Promise<Buffer> {
    // Generate a simple colored rectangle with the file extension text
    const thumbnailSize = this.configService.get<number>('THUMBNAIL_SIZE', 300);
    const ext = fileExtension.replace('.', '').toUpperCase();
    
    // Generate a consistent color based on extension
    const hash = crypto.createHash('md5').update(ext).digest('hex');
    const color = `#${hash.substring(0, 6)}`;
    
    try {
      return await sharp({
        create: {
          width: thumbnailSize,
          height: thumbnailSize,
          channels: 4,
          background: color,
        }
      })
        .composite([{
          input: {
            text: {
              text: ext,
              font: 'sans-serif',
              fontSize: 72,
              rgba: true,
            }
          },
          gravity: 'center',
        }])
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      this.logger.error(`Failed to create generic thumbnail: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get fallback thumbnail URL for error cases
   */
  private getFallbackThumbnail(fileExtension: string): { key: string; url: string } {
    // In a production system, you'd have pre-generated thumbnails for different file types
    // Here we return a placeholder URL
    const ext = fileExtension.replace('.', '').toLowerCase();
    const fallbackUrl = `/assets/thumbnails/generic_${ext}.webp`;
    
    return {
      key: `fallback/${ext}`,
      url: fallbackUrl,
    };
  }
  
  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    const tempDir = path.join(os.tmpdir(), 'aicloud-thumbnails');
    
    if (fs.existsSync(tempDir)) {
      try {
        // Remove files older than 1 hour
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;
          
          // If file is older than 1 hour, delete it
          if (fileAge > 3600000) {
            fs.unlinkSync(filePath);
            this.logger.debug(`Cleaned up temporary file: ${file}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to clean up temporary files: ${error.message}`, error.stack);
      }
    }
  }
}
