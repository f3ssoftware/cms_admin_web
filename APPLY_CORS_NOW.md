# Apply S3 CORS Configuration - Quick Guide

## The Problem
You were using:
- ❌ `AllowedHeaders: [""]` (empty string)
- ❌ `AllowedOrigins: ["http://localhost:5173/"]` (with trailing slash)

## The Solution - Use AWS Console (Most Reliable)

### Step 1: Open AWS S3 Console
Go to: https://s3.console.aws.amazon.com/s3/buckets?region=us-east-1

### Step 2: Select Your Bucket
Click on: **f3s-cms-admin**

### Step 3: Go to Permissions Tab
Click on the **Permissions** tab at the top

### Step 4: Edit CORS Configuration
1. Scroll down to **Cross-origin resource sharing (CORS)**
2. Click **Edit**
3. **Delete ALL existing configuration** (select all and delete)
4. **Paste this EXACT configuration:**

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://cms.f3ssoftware.com",
      "https://www.f3ssoftware.com"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 5: Save
Click **Save changes** at the bottom

### Step 6: Wait
Wait 1-2 minutes for changes to propagate

### Step 7: Test
Try uploading a file from your application again

## Important Notes

✅ **CORRECT:**
- `AllowedHeaders: ["*"]` (asterisk in quotes)
- `AllowedOrigins: ["http://localhost:5173"]` (NO trailing slash)

❌ **WRONG:**
- `AllowedHeaders: [""]` (empty string)
- `AllowedOrigins: ["http://localhost:5173/"]` (with trailing slash)

## Alternative: Use the JSON File

You can also copy the configuration from:
- `S3_CORS_EXACT_CONFIG.json` in this directory

Just open that file and copy its contents into the AWS Console.

