import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME || 'f3s-cms-admin';

export type FileType = 'image' | 'video';

export interface UploadFileOptions {
  file: File;
  type: FileType;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Uploads a file to S3
 * @param options - Upload options including file, type, and optional progress callback
 * @returns Promise with the uploaded file URL and S3 key
 */
export async function uploadFile({
  file,
  type,
  onProgress,
}: UploadFileOptions): Promise<UploadResult> {
  // Validate file type
  const folder = type === 'image' ? 'images' : 'videos';
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

  if (type === 'image' && !allowedImageTypes.includes(file.type)) {
    throw new Error(`Invalid image type. Allowed types: ${allowedImageTypes.join(', ')}`);
  }

  if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
    throw new Error(`Invalid video type. Allowed types: ${allowedVideoTypes.join(', ')}`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop() || '';
  const fileName = `${timestamp}_${randomString}.${fileExtension}`;
  const key = `${folder}/${fileName}`;

  // Prepare upload command
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
    ACL: 'public-read', // Make files publicly accessible
  });

  try {
    // Simulate progress for small files (S3 SDK doesn't provide native progress tracking)
    if (onProgress) {
      // Simulate progress in chunks
      const progressInterval = setInterval(() => {
        // This is a simplified progress simulation
        // For real progress tracking, you'd need to use multipart uploads
        onProgress(50);
      }, 100);
      
      await s3Client.send(command);
      clearInterval(progressInterval);
      if (onProgress) onProgress(100);
    } else {
      await s3Client.send(command);
    }

    // Construct the public URL
    // For us-east-1, the URL format is different (no region in URL)
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    const url = region === 'us-east-1'
      ? `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return {
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a file from S3
 * @param key - S3 object key (path)
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if AWS credentials are configured
 */
export function isS3Configured(): boolean {
  return !!(
    import.meta.env.VITE_AWS_ACCESS_KEY_ID &&
    import.meta.env.VITE_AWS_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_AWS_S3_BUCKET_NAME
  );
}

