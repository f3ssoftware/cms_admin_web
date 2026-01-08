# AWS S3 Integration Guide

This document describes the AWS S3 integration for the CMS Admin Web application.

## Overview

The application now supports direct file uploads to AWS S3 for images and videos. Files are automatically organized into two folders:
- `images/` - For image files (JPEG, PNG, GIF, WebP)
- `videos/` - For video files (MP4, WebM, OGG, QuickTime)

## Configuration

### Environment Variables

The following environment variables are required in your `.env` file:

```env
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
VITE_AWS_S3_BUCKET_NAME=f3s-cms-admin
VITE_AWS_REGION=us-east-1
```

### S3 Bucket Setup

1. **Bucket Configuration**
   - Bucket name: `f3s-cms-admin`
   - Region: `us-east-1` (or your preferred region)
   - Ensure the bucket exists and is accessible with the provided credentials

2. **Bucket Policy** (for public read access)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::f3s-cms-admin/*"
       }
     ]
   }
   ```

3. **CORS Configuration** (if needed for cross-origin requests)
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

4. **Block Public Access Settings**
   - You may need to allow public access to the bucket if you want files to be publicly accessible
   - Go to S3 Console → Bucket → Permissions → Block Public Access
   - Uncheck "Block all public access" if you want public read access

## Usage

### Rich Text Editor

The Rich Text Editor now includes two upload buttons:

1. **Image Upload** (🖼️ button)
   - Click to select and upload an image file
   - Supported formats: JPEG, JPG, PNG, GIF, WebP
   - Images are uploaded to `images/` folder in S3
   - The image is automatically inserted into the editor

2. **Video Upload** (🎥 button)
   - Click to select and upload a video file
   - Supported formats: MP4, WebM, OGG, QuickTime
   - Videos are uploaded to `videos/` folder in S3
   - The video is automatically inserted into the editor with controls

3. **Image URL** (📎 button)
   - Fallback option to insert images by URL
   - Useful for external images or existing S3 URLs

### Programmatic Usage

You can also use the S3 service directly in your components:

```typescript
import { uploadFile, deleteFile, isS3Configured } from '@/services/s3/s3Service';

// Upload an image
const result = await uploadFile({
  file: fileObject,
  type: 'image',
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  },
});

console.log('File URL:', result.url);
console.log('S3 Key:', result.key);

// Delete a file
await deleteFile(result.key);

// Check if S3 is configured
if (isS3Configured()) {
  // S3 is ready to use
}
```

## File Naming

Uploaded files are automatically renamed with a unique identifier:
- Format: `{timestamp}_{randomString}.{extension}`
- Example: `1704067200000_a3f5b2c1d4e6.png`
- This prevents filename conflicts and ensures uniqueness

## Security Considerations

⚠️ **Important Security Notes:**

1. **Credentials in Frontend**: The AWS credentials are stored in environment variables that are bundled into the frontend code. This means anyone can view these credentials in the browser's JavaScript bundle.

2. **Best Practice**: For production applications, consider:
   - Using a backend API to handle S3 uploads (presigned URLs)
   - Using AWS Cognito for temporary credentials
   - Implementing server-side upload endpoints
   - Using IAM roles with limited permissions

3. **Current Implementation**: The current implementation is suitable for:
   - Development environments
   - Internal/admin tools with restricted access
   - Applications where public access to credentials is acceptable

## Troubleshooting

### Upload Fails

1. **Check Credentials**: Verify that `VITE_AWS_ACCESS_KEY_ID` and `VITE_AWS_SECRET_ACCESS_KEY` are set correctly
2. **Check Bucket Name**: Ensure `VITE_AWS_S3_BUCKET_NAME` matches your actual bucket name
3. **Check Permissions**: Verify the IAM user/role has `s3:PutObject` permission
4. **Check Region**: Ensure `VITE_AWS_REGION` matches your bucket's region

### Files Not Accessible

1. **Check Bucket Policy**: Ensure public read access is enabled if needed
2. **Check CORS**: If accessing from a different domain, ensure CORS is configured
3. **Check URL Format**: Verify the generated URL matches your bucket's endpoint format

### CORS Errors

If you encounter CORS errors:
1. Add your domain to the S3 bucket's CORS configuration
2. Ensure the bucket policy allows the necessary operations
3. Check browser console for specific CORS error messages

## File Structure

```
src/
  services/
    s3/
      s3Service.ts    # S3 upload/delete service
  components/
    RichTextEditor/
      RichTextEditor.vue  # Updated with upload buttons
```

## API Reference

### `uploadFile(options: UploadFileOptions): Promise<UploadResult>`

Uploads a file to S3.

**Parameters:**
- `file: File` - The file to upload
- `type: 'image' | 'video'` - File type (determines folder)
- `onProgress?: (progress: number) => void` - Optional progress callback

**Returns:**
- `Promise<UploadResult>` - Object with `url` (public URL) and `key` (S3 key)

### `deleteFile(key: string): Promise<void>`

Deletes a file from S3.

**Parameters:**
- `key: string` - S3 object key (path)

### `isS3Configured(): boolean`

Checks if AWS credentials are configured.

**Returns:**
- `boolean` - True if all required environment variables are set

