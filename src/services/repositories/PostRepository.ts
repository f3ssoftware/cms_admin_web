/**
 * Post Repository
 * Data access layer for posts
 * Following Repository Pattern and Single Responsibility Principle
 */

import { api } from "@/convex/_generated/api";
import type {
  Post,
  PostId,
  CreatePostInput,
  UpdatePostInput,
  PostListFilters,
} from "@/types";
import { convexClientService } from "../convex/ConvexClientService";

/**
 * Interface for Post Repository
 */
export interface IPostRepository {
  list(filters?: PostListFilters): Promise<Post[]>;
  get(id: PostId): Promise<Post | null>;
  getByAuthor(authorId: string): Promise<Post[]>;
  create(input: CreatePostInput): Promise<PostId>;
  update(input: UpdatePostInput): Promise<void>;
  delete(id: PostId): Promise<void>;
}

/**
 * Post Repository Implementation
 */
export class PostRepository implements IPostRepository {
  /**
   * Get all posts with optional filters
   */
  list(filters?: PostListFilters): (callbacks: {
    onUpdate: (result: Post[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.posts.list, filters || {}, callbacks);
    };
  }

  /**
   * Get post by ID
   */
  get(id: PostId): (callbacks: {
    onUpdate: (result: Post | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.posts.get, { id }, callbacks);
    };
  }

  /**
   * Get posts by author
   */
  getByAuthor(authorId: string): (callbacks: {
    onUpdate: (result: Post[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.posts.getByAuthor, { authorId }, callbacks);
    };
  }

  /**
   * Create a new post
   */
  async create(input: CreatePostInput): Promise<PostId> {
    const result = await convexClientService.mutation(api.posts.create, input);
    return result as PostId;
  }

  /**
   * Update an existing post
   */
  async update(input: UpdatePostInput): Promise<void> {
    const { id, ...updates } = input;
    await convexClientService.mutation(api.posts.update, {
      id,
      ...updates,
    });
  }

  /**
   * Delete a post
   */
  async delete(id: PostId): Promise<void> {
    await convexClientService.mutation(api.posts.remove, { id });
  }
}

// Export singleton instance
export const postRepository = new PostRepository();

