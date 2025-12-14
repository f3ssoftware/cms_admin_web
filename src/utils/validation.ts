/**
 * Validation utilities
 * Following Single Responsibility Principle
 */

import { VALIDATION } from "@/constants";
import type { CreateCategoryInput, CreateNewsInput, CreatePostInput, CreatePostReplyInput } from "@/types";

/**
 * Validates category input
 */
export function validateCategory(input: CreateCategoryInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length < VALIDATION.CATEGORY.NAME_MIN_LENGTH) {
    errors.push(`Name must be at least ${VALIDATION.CATEGORY.NAME_MIN_LENGTH} characters`);
  }

  if (input.name && input.name.length > VALIDATION.CATEGORY.NAME_MAX_LENGTH) {
    errors.push(`Name must be no more than ${VALIDATION.CATEGORY.NAME_MAX_LENGTH} characters`);
  }

  if (!input.slug || input.slug.trim().length < VALIDATION.CATEGORY.SLUG_MIN_LENGTH) {
    errors.push(`Slug must be at least ${VALIDATION.CATEGORY.SLUG_MIN_LENGTH} characters`);
  }

  if (input.slug && !/^[a-z0-9-]+$/.test(input.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  if (input.description && input.description.length > VALIDATION.CATEGORY.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description must be no more than ${VALIDATION.CATEGORY.DESCRIPTION_MAX_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates news input
 */
export function validateNews(input: CreateNewsInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length < VALIDATION.NEWS.TITLE_MIN_LENGTH) {
    errors.push(`Title must be at least ${VALIDATION.NEWS.TITLE_MIN_LENGTH} characters`);
  }

  if (input.title && input.title.length > VALIDATION.NEWS.TITLE_MAX_LENGTH) {
    errors.push(`Title must be no more than ${VALIDATION.NEWS.TITLE_MAX_LENGTH} characters`);
  }

  if (!input.content || input.content.trim().length < VALIDATION.NEWS.CONTENT_MIN_LENGTH) {
    errors.push(`Content must be at least ${VALIDATION.NEWS.CONTENT_MIN_LENGTH} characters`);
  }

  if (input.excerpt && input.excerpt.length > VALIDATION.NEWS.EXCERPT_MAX_LENGTH) {
    errors.push(`Excerpt must be no more than ${VALIDATION.NEWS.EXCERPT_MAX_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates post input
 */
export function validatePost(input: CreatePostInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length < VALIDATION.POST.TITLE_MIN_LENGTH) {
    errors.push(`Title must be at least ${VALIDATION.POST.TITLE_MIN_LENGTH} characters`);
  }

  if (input.title && input.title.length > VALIDATION.POST.TITLE_MAX_LENGTH) {
    errors.push(`Title must be no more than ${VALIDATION.POST.TITLE_MAX_LENGTH} characters`);
  }

  if (!input.content || input.content.trim().length < VALIDATION.POST.CONTENT_MIN_LENGTH) {
    errors.push(`Content must be at least ${VALIDATION.POST.CONTENT_MIN_LENGTH} characters`);
  }

  if (input.excerpt && input.excerpt.length > VALIDATION.POST.EXCERPT_MAX_LENGTH) {
    errors.push(`Excerpt must be no more than ${VALIDATION.POST.EXCERPT_MAX_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates post reply input
 */
export function validatePostReply(input: CreatePostReplyInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.content || input.content.trim().length < VALIDATION.POST_REPLY.CONTENT_MIN_LENGTH) {
    errors.push(`Content must be at least ${VALIDATION.POST_REPLY.CONTENT_MIN_LENGTH} character`);
  }

  if (input.content && input.content.length > VALIDATION.POST_REPLY.CONTENT_MAX_LENGTH) {
    errors.push(`Content must be no more than ${VALIDATION.POST_REPLY.CONTENT_MAX_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}



