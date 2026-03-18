import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'us-west-1',
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

  // Convert File to Uint8Array to avoid ReadableStream issues with AWS SDK v3
  // The File object from the browser doesn't have getReader() method that SDK expects
  // Using Uint8Array instead of ArrayBuffer to ensure compatibility
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Prepare upload command
  // Note: ACL is removed because modern S3 buckets often have ACLs disabled
  // Public access should be configured via bucket policy instead
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: uint8Array,
    ContentType: file.type,
  });

  try {
    // Show initial progress
    if (onProgress) {
      onProgress(10);
    }

    // Upload to S3
    await s3Client.send(command);

    // Show completion
    if (onProgress) {
      onProgress(100);
    }

    // Construct the public URL
    // For us-east-1, the URL format is different (no region in URL)
    const region = import.meta.env.VITE_AWS_REGION || 'us-west-1';
    const url = region === 'us-east-1'
      ? `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return {
      url,
      key,
    };
  } catch (error: any) {
    console.error('Error uploading file to S3:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to upload file';
    if (error?.$metadata?.httpStatusCode === 400) {
      errorMessage = 'Bad Request - This might be due to ACL restrictions. Ensure your bucket allows public access via bucket policy.';
    } else if (error?.$metadata?.httpStatusCode === 403) {
      errorMessage = 'Access Denied - Check your AWS credentials and bucket permissions.';
    } else if (error?.message) {
      errorMessage = `Failed to upload file: ${error.message}`;
    }
    
    throw new Error(errorMessage);
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

