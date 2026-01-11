import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Helper function to create S3 client with current credentials
function createS3Client() {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials are not configured');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

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
  // Check if AWS credentials are configured
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

  // Debug: Log environment variable status (only in development)
  if (import.meta.env.DEV) {
    console.log('AWS S3 Environment Variables Check:', {
      hasAccessKeyId: !!accessKeyId,
      hasSecretAccessKey: !!secretAccessKey,
      hasBucketName: !!bucketName,
      accessKeyIdLength: accessKeyId?.length || 0,
      secretAccessKeyLength: secretAccessKey?.length || 0,
      bucketName: bucketName || 'not set',
      region: import.meta.env.VITE_AWS_REGION || 'not set',
    });
  }

  if (!accessKeyId || !secretAccessKey || !bucketName) {
    const missingVars = [];
    if (!accessKeyId) missingVars.push('VITE_AWS_ACCESS_KEY_ID');
    if (!secretAccessKey) missingVars.push('VITE_AWS_SECRET_ACCESS_KEY');
    if (!bucketName) missingVars.push('VITE_AWS_S3_BUCKET_NAME');
    
    throw new Error(
      `AWS S3 credentials are not configured. Missing: ${missingVars.join(', ')}. ` +
      `Please set these in your .env.local file (or .env file) in the cms_admin_web directory and restart the dev server.`
    );
  }

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

  // Convert File to ArrayBuffer for better compatibility with AWS SDK
  // This avoids issues with chunked encoding that requires ReadableStream
  let fileBuffer: ArrayBuffer;
  try {
    fileBuffer = await file.arrayBuffer();
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Create S3 client with current credentials
  const s3Client = createS3Client();

  // Prepare upload command
  // Note: ACL is removed because newer S3 buckets have ACLs disabled by default
  // Public access should be configured via bucket policy instead
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: new Uint8Array(fileBuffer), // Use Uint8Array - most compatible format
    ContentType: file.type,
    // ACL removed - use bucket policy for public access instead
  });

  let progressInterval: ReturnType<typeof setInterval> | null = null;

  try {
    // Simulate progress for small files (S3 SDK doesn't provide native progress tracking)
    if (onProgress) {
      // Simulate progress in chunks
      progressInterval = setInterval(() => {
        // This is a simplified progress simulation
        // For real progress tracking, you'd need to use multipart uploads
        onProgress(50);
      }, 100);
    }
    
    await s3Client.send(command);
    
    // Clear progress interval and set to 100%
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (onProgress) {
      onProgress(100);
    }

    // Construct the public URL
    // For us-east-1, the URL format is different (no region in URL)
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    const url = region === 'us-east-1'
      ? `https://${bucketName}.s3.amazonaws.com/${key}`
      : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return {
      url,
      key,
    };
  } catch (error) {
    // Clear progress interval on error
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    console.error('Error uploading file to S3:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a file from S3
 * @param key - S3 object key (path)
 */
export async function deleteFile(key: string): Promise<void> {
  // Check if AWS credentials are configured
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      'AWS S3 credentials are not configured. Please set VITE_AWS_ACCESS_KEY_ID, VITE_AWS_SECRET_ACCESS_KEY, and VITE_AWS_S3_BUCKET_NAME in your .env file.'
    );
  }

  try {
    const s3Client = createS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
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

