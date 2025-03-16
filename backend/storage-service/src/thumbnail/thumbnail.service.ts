import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

@Injectable()
export class ThumbnailService {
  async generateThumbnail(
    buffer: Buffer,
    fileType: string,
    mimeType: string,
  ): Promise<Buffer> {
    try {
      if (fileType === 'image') {
        return this.generateImageThumbnail(buffer);
      } else if (fileType === 'video') {
        return this.generateVideoThumbnail(buffer);
      } else {
        throw new BadRequestException('Unsupported file type for thumbnail generation');
      }
    } catch (error) {
      console.error(`Error generating thumbnail: ${error.message}`);
      throw new Error(`Failed to generate thumbnail: ${error.message}`);
    }
  }

  private async generateImageThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error(`Error generating image thumbnail: ${error.message}`);
      throw error;
    }
  }

  private async generateVideoThumbnail(buffer: Buffer): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create temporary files for video input and thumbnail output
        const tempVideoFile = tmp.fileSync({ postfix: '.mp4' });
        const tempThumbFile = tmp.fileSync({ postfix: '.jpg' });
        
        // Write the video buffer to the temp file
        await writeFile(tempVideoFile.name, buffer);
        
        // Use ffmpeg to extract a frame
        ffmpeg(tempVideoFile.name)
          .on('error', (err) => {
            tempVideoFile.removeCallback();
            tempThumbFile.removeCallback();
            reject(new Error(`FFmpeg error: ${err.message}`));
          })
          .on('end', async () => {
            try {
              // Read the thumbnail into a buffer
              const thumbnailBuffer = await readFile(tempThumbFile.name);
              
              // Clean up temp files
              tempVideoFile.removeCallback();
              tempThumbFile.removeCallback();
              
              // Resize the thumbnail with sharp
              const resizedThumbnail = await sharp(thumbnailBuffer)
                .resize(300, 300, {
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .jpeg({ quality: 80 })
                .toBuffer();
              
              resolve(resizedThumbnail);
            } catch (error) {
              tempVideoFile.removeCallback();
              tempThumbFile.removeCallback();
              reject(error);
            }
          })
          .screenshots({
            count: 1,
            folder: tmp.dirSync().name,
            filename: path.basename(tempThumbFile.name),
            size: '320x240',
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}