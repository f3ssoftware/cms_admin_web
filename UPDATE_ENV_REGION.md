# Update Environment Variable for S3 Region

## The Issue
Your S3 bucket is in `us-west-1`, but your frontend code was using `us-east-1` as the default, causing CORS errors.

## The Fix

### Step 1: Update `.env` file

Open `cms_admin_web/.env` and make sure you have:

```env
VITE_AWS_REGION=us-west-1
```

**Important:** The region must be `us-west-1` (not `us-east-1`)

### Step 2: Restart Dev Server

After updating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
```

### Step 3: Test Upload

Try uploading a file again. The CORS errors should be resolved.

## What Was Fixed

1. ✅ Updated `s3Service.ts` to use `us-west-1` as default region
2. ✅ Updated `env.example` to reflect the correct region
3. ✅ CORS configuration was already applied to the bucket in `us-west-1`

## Verification

After restarting, check the browser console. The upload URL should now be:
- ✅ `https://f3s-cms-admin.s3.us-west-1.amazonaws.com/...`
- ❌ NOT `https://f3s-cms-admin.s3.us-east-1.amazonaws.com/...`

