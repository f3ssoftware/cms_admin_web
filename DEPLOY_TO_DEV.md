# Deploy to Dev Deployment (abundant-narwhal-987)

## Current Situation

- ✅ Functions deployed to **production**: `tough-perch-100.convex.cloud`
- ⚠️ Next.js app configured for **dev**: `abundant-narwhal-987.convex.cloud`
- ❌ Dev deployment doesn't have updated functions

## Solution Options

### Option 1: Deploy to Dev Deployment (Recommended if you want to use dev)

Since `abundant-narwhal-987` is a dev deployment, you need to use `npx convex dev`:

```bash
cd cms_admin_web
npx convex dev --once --typecheck=disable
```

**Note**: `npx convex dev` doesn't have a `--typecheck` flag, so you'll need to:
1. Ensure `convex/tsconfig.json` has `"skipLibCheck": true` (already done)
2. Or temporarily fix the TypeScript errors

### Option 2: Update Next.js to Use Production (Quick Fix)

Since functions are already on `tough-perch-100`:

1. Update `f3sNextjsSite/.env.local`:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://tough-perch-100.convex.cloud
   ```

2. Restart Next.js dev server

### Option 3: Use Production Deployment for Both

1. Update `cms_admin_web/.env.local`:
   ```env
   VITE_CONVEX_URL=https://tough-perch-100.convex.cloud
   ```

2. Update `f3sNextjsSite/.env.local`:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://tough-perch-100.convex.cloud
   ```

## Recommended Action

**Use Option 2** (quickest fix):
- Functions are already deployed to `tough-perch-100`
- Just update the Next.js app's environment variable
- No need to redeploy

