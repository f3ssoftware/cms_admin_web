/**
 * Core type definitions for the application
 * Following TypeScript best practices and SOLID principles
 */

// ==================== User & Authentication Types ====================

export interface User {
  id: string; // Keycloak user ID (sub claim)
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

// ==================== Convex Types ====================

import type { Id } from "../convex/_generated/dataModel";

export type CategoryId = Id<"categories">;
export type NewsId = Id<"news">;
export type PostId = Id<"post">;
export type PostReplyId = Id<"post_reply">;
export type NewsTranslationId = Id<"newsTranslations">;

// ==================== Category Types ====================

export interface Category {
  _id: CategoryId;
  _creationTime: number;
  name: string;
  description?: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  slug: string;
}

export interface UpdateCategoryInput {
  id: CategoryId;
  name?: string;
  description?: string;
  slug?: string;
}

// ==================== News Types ====================

export interface News {
  _id: NewsId;
  _creationTime: number;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string; // S3 URL for cover image
  categoryId: CategoryId;
  authorId: string; // Keycloak user ID
  published: boolean;
  isFeatured?: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateNewsInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string; // S3 URL for cover image
  categoryId: CategoryId;
  authorId: string;
  published: boolean;
  isFeatured?: boolean;
}

export interface UpdateNewsInput {
  id: NewsId;
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string; // S3 URL for cover image
  categoryId?: CategoryId;
  published?: boolean;
  isFeatured?: boolean;
}

export interface NewsListFilters {
  published?: boolean;
  categoryId?: CategoryId;
}

// ==================== News Translation Types ====================

/**
 * Supported locales for translations
 * "en" is the source of truth in the news table
 * Other locales are stored in newsTranslations table
 */
export type Locale = "en" | "pt" | "es" | "fr";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "pt", "es", "fr"] as const;
export const TRANSLATION_LOCALES: readonly Locale[] = ["pt", "es", "fr"] as const;

export type TranslationStatus = "draft" | "review" | "published";

export interface NewsTranslation {
  _id: NewsTranslationId;
  _creationTime: number;
  newsId: NewsId;
  locale: Locale;
  title: string;
  excerpt?: string;
  body: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: TranslationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTranslationInput {
  newsId: NewsId;
  locale: Locale;
  title: string;
  excerpt?: string;
  body: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: TranslationStatus;
}

export interface UpdateTranslationInput {
  newsId: NewsId;
  locale: Locale;
  title?: string;
  excerpt?: string;
  body?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: TranslationStatus;
}

export interface TranslationCoverage {
  total: number;
  translated: number;
  missing: Locale[];
  coverage: Record<Locale, { exists: boolean; updatedAt?: number }>;
}

export interface NewsWithCoverage extends News {
  translationCoverage: TranslationCoverage;
}

export interface NewsWithTranslation {
  news: News;
  translation: NewsTranslation | null;
  effective: {
    title: string;
    excerpt: string;
    body: string;
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

// ==================== Post Types ====================

export interface Post {
  _id: PostId;
  _creationTime: number;
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: CategoryId;
  authorId: string; // Keycloak user ID
  published: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: CategoryId;
  authorId: string;
  published: boolean;
}

export interface UpdatePostInput {
  id: PostId;
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: CategoryId;
  published?: boolean;
}

export interface PostListFilters {
  published?: boolean;
  categoryId?: CategoryId;
}

// ==================== Post Reply Types ====================

export interface PostReply {
  _id: PostReplyId;
  _creationTime: number;
  postId: PostId;
  authorId: string; // Keycloak user ID
  content: string;
  parentReplyId?: PostReplyId;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePostReplyInput {
  postId: PostId;
  authorId: string;
  content: string;
  parentReplyId?: PostReplyId;
}

export interface UpdatePostReplyInput {
  id: PostReplyId;
  content: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== Error Types ====================

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export class ConvexError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ConvexError";
  }
}

// ==================== Utility Types ====================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;





