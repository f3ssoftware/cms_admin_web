/**
 * News Repository
 * Data access layer for news articles
 * Following Repository Pattern and Single Responsibility Principle
 */

import { api } from "@/convex/_generated/api";
import type {
  News,
  NewsId,
  CreateNewsInput,
  UpdateNewsInput,
  NewsListFilters,
} from "@/types";
import { convexClientService } from "../convex/ConvexClientService";

/**
 * Interface for News Repository
 */
export interface INewsRepository {
  list(filters?: NewsListFilters): Promise<News[]>;
  get(id: NewsId): Promise<News | null>;
  getByAuthor(authorId: string): Promise<News[]>;
  create(input: CreateNewsInput): Promise<NewsId>;
  update(input: UpdateNewsInput): Promise<void>;
  delete(id: NewsId): Promise<void>;
}

/**
 * News Repository Implementation
 */
export class NewsRepository implements INewsRepository {
  /**
   * Get all news articles with optional filters
   * Returns a subscription function for reactive updates
   */
  list(filters?: NewsListFilters): (callbacks: {
    onUpdate: (result: News[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.news.list, filters || {}, callbacks);
    };
  }

  /**
   * Get news article by ID
   */
  get(id: NewsId): (callbacks: {
    onUpdate: (result: News | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.news.get, { id }, callbacks);
    };
  }

  /**
   * Get news articles by author
   */
  getByAuthor(authorId: string): (callbacks: {
    onUpdate: (result: News[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.news.getByAuthor, { authorId }, callbacks);
    };
  }

  /**
   * Create a new news article
   */
  async create(input: CreateNewsInput): Promise<NewsId> {
    const result = await convexClientService.mutation(api.news.create, input);
    return result as NewsId;
  }

  /**
   * Update an existing news article
   */
  async update(input: UpdateNewsInput): Promise<void> {
    const { id, ...updates } = input;
    await convexClientService.mutation(api.news.update, {
      id,
      ...updates,
    });
  }

  /**
   * Delete a news article
   */
  async delete(id: NewsId): Promise<void> {
    await convexClientService.mutation(api.news.remove, { id });
  }
}

// Export singleton instance
export const newsRepository = new NewsRepository();

