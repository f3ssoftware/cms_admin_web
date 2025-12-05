/**
 * Post Reply Repository
 * Data access layer for post replies
 * Following Repository Pattern and Single Responsibility Principle
 */

import { api } from "@/convex/_generated/api";
import type {
  PostReply,
  PostReplyId,
  PostId,
  CreatePostReplyInput,
  UpdatePostReplyInput,
} from "@/types";
import { convexClientService } from "../convex/ConvexClientService";

/**
 * Interface for Post Reply Repository
 */
export interface IPostReplyRepository {
  listByPost(postId: PostId): Promise<PostReply[]>;
  get(id: PostReplyId): Promise<PostReply | null>;
  getByAuthor(authorId: string): Promise<PostReply[]>;
  getByParent(parentReplyId: PostReplyId): Promise<PostReply[]>;
  create(input: CreatePostReplyInput): Promise<PostReplyId>;
  update(input: UpdatePostReplyInput): Promise<void>;
  delete(id: PostReplyId): Promise<void>;
}

/**
 * Post Reply Repository Implementation
 */
export class PostReplyRepository implements IPostReplyRepository {
  /**
   * Get all replies for a post
   */
  listByPost(postId: PostId): (callbacks: {
    onUpdate: (result: PostReply[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.postReplies.listByPost, { postId }, callbacks);
    };
  }

  /**
   * Get reply by ID
   */
  get(id: PostReplyId): (callbacks: {
    onUpdate: (result: PostReply | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.postReplies.get, { id }, callbacks);
    };
  }

  /**
   * Get replies by author
   */
  getByAuthor(authorId: string): (callbacks: {
    onUpdate: (result: PostReply[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.postReplies.getByAuthor, { authorId }, callbacks);
    };
  }

  /**
   * Get nested replies (replies to a reply)
   */
  getByParent(parentReplyId: PostReplyId): (callbacks: {
    onUpdate: (result: PostReply[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.postReplies.getByParent, { parentReplyId }, callbacks);
    };
  }

  /**
   * Create a new reply
   */
  async create(input: CreatePostReplyInput): Promise<PostReplyId> {
    const result = await convexClientService.mutation(api.postReplies.create, input);
    return result as PostReplyId;
  }

  /**
   * Update an existing reply
   */
  async update(input: UpdatePostReplyInput): Promise<void> {
    const { id, ...updates } = input;
    await convexClientService.mutation(api.postReplies.update, {
      id,
      ...updates,
    });
  }

  /**
   * Delete a reply
   */
  async delete(id: PostReplyId): Promise<void> {
    await convexClientService.mutation(api.postReplies.remove, { id });
  }
}

// Export singleton instance
export const postReplyRepository = new PostReplyRepository();

