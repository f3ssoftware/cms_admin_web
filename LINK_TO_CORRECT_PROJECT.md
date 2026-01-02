# Link Convex to Correct Project (abundant-narwhal-987)

## Problem
The Convex functions were deployed to the wrong project (`tough-perch-100` instead of `abundant-narwhal-987`).

## Solution

### Option 1: Interactive Linking (Recommended)

1. **Run Convex dev in interactive mode:**
   ```bash
   cd cms_admin_web
   npx convex dev
   ```

2. **When prompted, select:**
   - "choose an existing project"
   - Select the project that contains deployment `abundant-narwhal-987`
   - Confirm the selection

3. **After linking, deploy with:**
   ```bash
   npx convex deploy --typecheck=disable --yes
   ```

### Option 2: Manual Configuration

If you know the project name/ID, you can try:

1. **Check your Convex dashboard:**
   - Go to https://dashboard.convex.dev
   - Find the project with deployment `abundant-narwhal-987`
   - Note the project name/ID

2. **Set environment variable:**
   ```bash
   export CONVEX_DEPLOYMENT=abundant-narwhal-987
   npx convex deploy --typecheck=disable --yes
   ```

### Verify Deployment

After deployment, verify it worked by checking:
- The deployment URL in the output should be `https://abundant-narwhal-987.convex.cloud`
- Your Next.js app should now work with locale parameters
- Check the Convex dashboard to confirm functions are deployed

## Current Status

✅ **Convex functions updated** with locale support:
- `news.list` - accepts `locale` parameter
- `news.get` - accepts `locale` parameter  
- `news.getByCategorySlug` - accepts `locale` parameter
- `news.getFeatured` - accepts `locale` parameter
- `mergeNewsWithTranslation` helper function implemented

✅ **Next.js code updated** to pass locale to all queries

⏳ **Waiting for deployment** to the correct project

