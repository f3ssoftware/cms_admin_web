# S3 Bucket Policy Setup for Public Read Access

## The Issue

The 400 Bad Request error is likely because:
1. The bucket has ACLs disabled (common in modern S3 buckets)
2. We removed `ACL: 'public-read'` from the upload code
3. The bucket needs a bucket policy to allow public read access

## Solution: Configure Bucket Policy

### Step 1: Go to AWS S3 Console

1. Navigate to: https://s3.console.aws.amazon.com/
2. Click on your bucket: **f3s-cms-admin**
3. Go to the **Permissions** tab
4. Scroll down to **Bucket policy**
5. Click **Edit**

### Step 2: Add Bucket Policy

Paste this JSON policy (replace `f3s-cms-admin` with your bucket name if different):

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

### Step 3: Save the Policy

Click **Save changes**

### Step 4: Block Public Access Settings

1. Still in the **Permissions** tab
2. Scroll to **Block public access (bucket settings)**
3. Click **Edit**
4. **Uncheck** the following (if you want public read access):
   - ✅ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through new public bucket or access point policies
   - ✅ Block public and cross-account access to buckets and objects through any public bucket or access point policies

   **OR** keep them checked if you only want the bucket policy to control access.

5. Click **Save changes**
6. Type `confirm` when prompted

### Step 5: Test Upload

After configuring the bucket policy, try uploading a file again from your application.

## Alternative: Enable ACLs (Not Recommended)

If you prefer to use ACLs instead of bucket policies:

1. Go to **Permissions** → **Object Ownership**
2. Select **ACLs enabled**
3. Select **Bucket owner preferred** (or **Object writer** if you want the uploader to own the object)
4. Save changes
5. Then you can add `ACL: 'public-read'` back to the upload command

**Note:** Bucket policies are generally preferred over ACLs for better security and control.

## Verification

After setup, uploaded files should be accessible at:
- `https://f3s-cms-admin.s3.us-west-1.amazonaws.com/images/...`
- `https://f3s-cms-admin.s3.us-west-1.amazonaws.com/videos/...`

Try accessing a file URL directly in your browser to verify public access is working.

