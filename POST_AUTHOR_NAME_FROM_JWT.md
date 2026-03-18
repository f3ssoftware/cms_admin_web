# Post Author Name from JWT Token

## Overview

The CMS admin now extracts and stores the author's name directly from the Keycloak JWT token when creating posts. This matches the implementation for news articles and ensures author information is persisted at creation time.

## JWT Token Structure

The Keycloak JWT token includes the following user information:

```json
{
  "sub": "d4b52843-c584-4b50-9258-55b2dc648965",
  "name": "Felipe Sampaio",
  "preferred_username": "felipe.sampaio@f3ssoftware.com",
  "given_name": "Felipe",
  "family_name": "Sampaio",
  "email": "felipe.sampaio@f3ssoftware.com"
}
```

## Author Name Extraction Priority

When creating a post, the system extracts the author name in the following priority order:

1. **`name`** - Full name from JWT (e.g., "Felipe Sampaio") ← **Preferred**
2. **`given_name + family_name`** - First name + Last name (e.g., "Felipe Sampaio")
3. **`given_name`** - First name only (e.g., "Felipe")
4. **`preferred_username`** - Username as fallback (e.g., "felipe.sampaio@f3ssoftware.com")

## Changes Made

### 1. **Convex Schema** (`convex/schema.ts`)
- Added `authorName: v.optional(v.string())` to the `post` table

### 2. **Convex Mutations** (`convex/posts.ts`)
- Updated `create` mutation to accept and store `authorName`
- Updated `update` mutation to allow updating `authorName`

### 3. **TypeScript Types** (`src/types/index.ts`)
- Added `name?: string` to `User` interface (full name from JWT)
- Added `authorName?: string` to `Post`, `CreatePostInput`, and `UpdatePostInput` interfaces

### 4. **Keycloak Integration** (`src/lib/keycloak.ts`)
- Updated `getUserInfo()` to extract `name` field from JWT token

### 5. **Auth Store** (`src/stores/auth.ts`)
- Updated `syncUser()` to include `name` field in user object

### 6. **Post Composable** (`src/composables/usePost.ts`)
- Created new `usePost` composable (similar to `useNews`)
- `createPost` function extracts author name from JWT using priority order
- Automatically includes `authorName` when creating posts

## Usage

### Creating a Post

```typescript
import { usePost } from '@/composables/usePost';
import { useAuthStore } from '@/stores/auth';

const { createPost } = usePost();
const authStore = useAuthStore();

// Create a post - authorName is automatically extracted from JWT
const postId = await createPost({
  title: "My Post Title",
  content: "Post content...",
  excerpt: "Short description",
  categoryId: "category-id",
  published: true,
});

// The post will automatically include:
// - authorId: from authStore.user.id
// - authorName: from authStore.user.name (or firstName + lastName, or username)
```

### Accessing Author Name

```typescript
// In a component
const { posts, currentPost } = usePost();

// Author name is available on the post object
console.log(post.authorName); // "Felipe Sampaio"
console.log(post.authorId);   // "d4b52843-c584-4b50-9258-55b2dc648965"
```

## Benefits

✅ **Performance**: Author name is stored at creation time, no API calls needed  
✅ **Reliability**: Author name is preserved even if user is deleted from Keycloak  
✅ **Efficiency**: Uses JWT token data that's already available  
✅ **Consistency**: Same implementation pattern as news articles  
✅ **Flexibility**: Falls back gracefully if name fields are missing

## Migration

Existing posts without `authorName` will:
- Have `authorName` as `undefined`
- Can be updated manually if needed
- New posts will always have `authorName` stored

## Testing

1. **Create a new post** in CMS admin
2. **Verify** the post includes `authorName` field
3. **Check** that the name matches the JWT token's `name` field
4. **Test fallback** by checking posts created with different JWT token structures

## Notes

- The `authorName` is extracted from the JWT token at post creation time
- If the user's name changes in Keycloak, existing posts will still show the old name
- To update author names for existing posts, you can:
  - Update them manually in the CMS
  - Or run a migration script to fetch and update from Keycloak
- The `usePost` composable follows the same pattern as `useNews` for consistency

