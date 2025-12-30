/**
 * News Translation Repository
 * Data access layer for news translations
 * Following Repository Pattern and Single Responsibility Principle
 */

import { api } from "@/convex/_generated/api";
import type {
  NewsId,
  Locale,
  NewsTranslation,
  CreateTranslationInput,
  UpdateTranslationInput,
  NewsWithTranslation,
  NewsWithCoverage,
  NewsListFilters,
} from "@/types";
import { convexClientService } from "../convex/ConvexClientService";

/**
 * Interface for News Translation Repository
 */
export interface INewsTranslationRepository {
  getTranslation(newsId: NewsId, locale: Locale): Promise<NewsTranslation | null>;
  getNewsWithTranslation(newsId: NewsId, locale: Locale): Promise<NewsWithTranslation>;
  listNewsForAdmin(filters?: NewsListFilters): Promise<NewsWithCoverage[]>;
  upsertTranslation(input: CreateTranslationInput | UpdateTranslationInput): Promise<string>;
  deleteTranslation(newsId: NewsId, locale: Locale): Promise<void>;
  setTranslationStatus(newsId: NewsId, locale: Locale, status: "draft" | "review" | "published"): Promise<void>;
  createMissingTranslations(newsId: NewsId): Promise<string[]>;
}

/**
 * News Translation Repository Implementation
 */
export class NewsTranslationRepository implements INewsTranslationRepository {
  /**
   * Get translation for a specific news item and locale
   */
  getTranslation(newsId: NewsId, locale: Locale): (callbacks: {
    onUpdate: (result: NewsTranslation | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(
        api.newsTranslations.getTranslation,
        { newsId, locale },
        callbacks
      );
    };
  }

  /**
   * Get news with translation, returning effective content
   */
  getNewsWithTranslation(newsId: NewsId, locale: Locale): (callbacks: {
    onUpdate: (result: NewsWithTranslation) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(
        api.newsTranslations.getNewsWithTranslation,
        { newsId, locale },
        callbacks
      );
    };
  }

  /**
   * List news for admin with translation coverage
   */
  listNewsForAdmin(filters?: NewsListFilters): (callbacks: {
    onUpdate: (result: NewsWithCoverage[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(
        api.newsTranslations.listNewsForAdmin,
        filters || {},
        callbacks
      );
    };
  }

  /**
   * Upsert translation (create or update)
   */
  async upsertTranslation(input: CreateTranslationInput | UpdateTranslationInput): Promise<string> {
    const result = await convexClientService.mutation(api.newsTranslations.upsertTranslation, {
      newsId: input.newsId,
      locale: input.locale,
      title: input.title || "",
      excerpt: input.excerpt,
      body: input.body || "",
      slug: input.slug,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      status: input.status,
    });
    return result as string;
  }

  /**
   * Delete translation
   */
  async deleteTranslation(newsId: NewsId, locale: Locale): Promise<void> {
    await convexClientService.mutation(api.newsTranslations.deleteTranslation, {
      newsId,
      locale,
    });
  }

  /**
   * Set translation status
   */
  async setTranslationStatus(
    newsId: NewsId,
    locale: Locale,
    status: "draft" | "review" | "published"
  ): Promise<void> {
    await convexClientService.mutation(api.newsTranslations.setTranslationStatus, {
      newsId,
      locale,
      status,
    });
  }

  /**
   * Create empty draft translations for missing locales
   */
  async createMissingTranslations(newsId: NewsId): Promise<string[]> {
    const result = await convexClientService.mutation(
      api.newsTranslations.createMissingTranslations,
      { newsId }
    );
    return result as string[];
  }
}

// Export singleton instance
export const newsTranslationRepository = new NewsTranslationRepository();

