# S3 CORS Configuration Fix

## The Problem

You were using:
- `AllowedHeaders: [""]` ❌ (empty string - WRONG)
- `AllowedOrigins: ["http://localhost:5173/"]` ❌ (trailing slash - WRONG)

## The Solution

Use this **exact** configuration:

### Correct Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
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

## How to Apply via AWS Console

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click on your bucket: `f3s-cms-admin`
3. Go to the **Permissions** tab
4. Scroll down to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. **Delete** any existing configuration
7. **Paste** the JSON from `S3_CORS_EXACT_CONFIG.json` (or copy from above)
8. Click **Save changes**

## Important Notes

✅ **DO:**
- Use `AllowedHeaders: ["*"]` (asterisk in quotes)
- Remove trailing slashes from origins: `http://localhost:5173` (NOT `http://localhost:5173/`)
- Use exact origin matches (no wildcards like `https://*.f3ssoftware.com`)

❌ **DON'T:**
- Use `AllowedHeaders: [""]` (empty string)
- Add trailing slashes to origins
- Use wildcards in `AllowedOrigins` (S3 doesn't support them)

## Verification

After applying, wait 1-2 minutes for changes to propagate, then test uploading a file from your application.

If CORS errors persist:
1. Clear your browser cache
2. Check the browser's Network tab to see the exact CORS error
3. Verify the origin in the error matches exactly one of your `AllowedOrigins` (case-sensitive, no trailing slash)

