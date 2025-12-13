// Runtime API for Convex
// This file provides runtime function references for Convex API calls
// The Convex client uses these references to call backend functions

import type { api as ApiType, internal as InternalType } from '../../../convex/_generated/api';
import type { FunctionReference } from "convex/server";

// Helper to create a function reference that Convex client can use
// The client will resolve these module/function paths at runtime
function createFunctionRef(module: string, functionName: string): FunctionReference<"query" | "mutation", "public", any, any> {
  // Create a function reference object that matches Convex's expected format
  // The actual resolution happens in the Convex client
  return {
    _value: {
      module,
      function: functionName,
    },
  } as any;
}

// Export the API object with all function references
// This structure matches what the Convex client expects
export const api: typeof ApiType = {
  categories: {
    list: createFunctionRef("categories", "list"),
    get: createFunctionRef("categories", "get"),
    getBySlug: createFunctionRef("categories", "getBySlug"),
    create: createFunctionRef("categories", "create"),
    update: createFunctionRef("categories", "update"),
    remove: createFunctionRef("categories", "remove"),
  },
  news: {
    list: createFunctionRef("news", "list"),
    get: createFunctionRef("news", "get"),
    getByAuthor: createFunctionRef("news", "getByAuthor"),
    create: createFunctionRef("news", "create"),
    update: createFunctionRef("news", "update"),
    remove: createFunctionRef("news", "remove"),
  },
  posts: {
    list: createFunctionRef("posts", "list"),
    get: createFunctionRef("posts", "get"),
    getByAuthor: createFunctionRef("posts", "getByAuthor"),
    create: createFunctionRef("posts", "create"),
    update: createFunctionRef("posts", "update"),
    remove: createFunctionRef("posts", "remove"),
  },
  postReplies: {
    list: createFunctionRef("postReplies", "list"),
    get: createFunctionRef("postReplies", "get"),
    getByPost: createFunctionRef("postReplies", "getByPost"),
    getByAuthor: createFunctionRef("postReplies", "getByAuthor"),
    create: createFunctionRef("postReplies", "create"),
    update: createFunctionRef("postReplies", "update"),
    remove: createFunctionRef("postReplies", "remove"),
  },
} as typeof ApiType;

export const internal: typeof InternalType = {} as typeof InternalType;
