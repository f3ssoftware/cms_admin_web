/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 * To regenerate, run `npx convex dev` or `npx convex codegen`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as categories from "../categories.js";
import type * as news from "../news.js";
import type * as postReplies from "../postReplies.js";
import type * as posts from "../posts.js";
import type * as schema from "../schema.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * @example
 * ```ts
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  categories: typeof categories;
  news: typeof news;
  postReplies: typeof postReplies;
  posts: typeof posts;
  schema: typeof schema;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */

