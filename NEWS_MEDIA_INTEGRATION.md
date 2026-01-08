# News Media Integration Guide

This document describes the media integration features added to the News creation and editing system.

## Features Added

### 1. Cover Image Upload
- **Location**: News creation/edit form
- **Functionality**: 
  - Upload cover images directly to AWS S3
  - Images are stored in the `images/` folder
  - Preview before saving
  - Remove/replace cover images
  - Recommended size: 1200x630px

### 2. Rich Content Media Support
- **Location**: Rich Text Editor toolbar
- **Image Upload** (🖼️ button):
  - Upload images directly to S3 `images/` folder
  - Images are automatically inserted into the content
  - Supported formats: JPEG, JPG, PNG, GIF, WebP

- **Video Upload** (🎥 button):
  - Upload videos directly to S3 `videos/` folder
  - Videos are automatically inserted with HTML5 video controls
  - Supported formats: MP4, WebM, OGG, QuickTime

- **Image URL** (📎 button):
  - Fallback option to insert images by URL
  - Useful for external images or existing S3 URLs

## Database Schema Changes

### News Table
Added new optional field:
```typescript
coverImage?: string; // S3 URL for cover image
```

## TypeScript Types Updated

### News Interface
```typescript
export interface News {
  // ... existing fields
  coverImage?: string; // S3 URL for cover image
}
```

### CreateNewsInput
```typescript
export interface CreateNewsInput {
  // ... existing fields
  coverImage?: string; // S3 URL for cover image
}
```

### UpdateNewsInput
```typescript
export interface UpdateNewsInput {
  // ... existing fields
  coverImage?: string; // S3 URL for cover image
}
```

## Usage

### Creating/Editing News with Cover Image

1. **Navigate** to News creation or edit page
2. **Fill in** the required fields (Title, Category, Content)
3. **Upload Cover Image**:
   - Click "Upload Cover Image" button
   - Select an image file
   - Wait for upload to complete
   - Preview will appear
   - Click "Remove" to delete and upload a different image
4. **Add Media to Content**:
   - Use the Rich Text Editor toolbar
   - Click 🖼️ to upload and insert images
   - Click 🎥 to upload and insert videos
   - Click 📎 to insert images by URL
5. **Save** the article

### Cover Image Best Practices

- **Recommended dimensions**: 1200x630px (Facebook/LinkedIn Open Graph standard)
- **File size**: Keep under 2MB for faster loading
- **Format**: JPEG or PNG recommended
- **Aspect ratio**: 1.91:1 (width:height) works best

### Content Media Best Practices

- **Images**: 
  - Use high-quality images
  - Optimize before uploading (compress if needed)
  - Recommended max width: 1200px for content images
  
- **Videos**:
  - Keep file sizes reasonable (< 50MB recommended)
  - Use MP4 format for best browser compatibility
  - Consider video length (shorter is better for web)

## Technical Implementation

### Files Modified

1. **Schema** (`convex/schema.ts`):
   - Added `coverImage` field to news table

2. **Convex Mutations** (`convex/news.ts`):
   - Updated `create` mutation to accept `coverImage`
   - Updated `update` mutation to accept `coverImage`

3. **TypeScript Types** (`src/types/index.ts`):
   - Added `coverImage` to `News`, `CreateNewsInput`, and `UpdateNewsInput` interfaces

4. **News Edit Form** (`src/pages/NewsEdit.vue`):
   - Added cover image upload UI
   - Added preview functionality
   - Integrated S3 upload service
   - Updated form state and submission handlers

5. **Rich Text Editor** (`src/components/RichTextEditor/RichTextEditor.vue`):
   - Already configured with image and video upload buttons
   - Integrated with S3 service
   - Supports direct file uploads to S3

### S3 Integration

All media files are uploaded to:
- **Cover Images**: `s3://f3s-cms-admin/images/{timestamp}_{random}.{ext}`
- **Content Images**: `s3://f3s-cms-admin/images/{timestamp}_{random}.{ext}`
- **Content Videos**: `s3://f3s-cms-admin/videos/{timestamp}_{random}.{ext}`

Files are automatically made publicly accessible via S3 public URLs.

## Migration Notes

### For Existing News Articles

- Existing news articles without cover images will continue to work
- The `coverImage` field is optional
- You can add cover images to existing articles by editing them

### Convex Schema Migration

The schema change is backward compatible:
- Existing news records will have `coverImage: undefined`
- New records can optionally include `coverImage`
- No migration script needed

## Troubleshooting

### Cover Image Not Uploading

1. **Check AWS Credentials**: Verify `.env` file has correct AWS credentials
2. **Check S3 Permissions**: Ensure IAM user has `s3:PutObject` permission
3. **Check File Size**: Large files may timeout
4. **Check Browser Console**: Look for error messages

### Media Not Appearing in Content

1. **Check Upload Status**: Look for upload progress indicators
2. **Check S3 URL**: Verify the generated URL is accessible
3. **Check Browser Console**: Look for JavaScript errors
4. **Check CORS**: Ensure S3 bucket CORS is configured if needed

### Video Not Playing

1. **Check Format**: Ensure video is in a supported format (MP4 recommended)
2. **Check URL**: Verify the S3 URL is accessible
3. **Check Browser**: Some browsers have format restrictions
4. **Check File Size**: Very large videos may not load properly

## Future Enhancements

Potential improvements:
- Image cropping/resizing before upload
- Video thumbnail generation
- Media library/gallery for reusing uploaded files
- Image optimization/compression on upload
- Drag-and-drop file upload
- Multiple image upload at once
- Media file management (delete unused files)

