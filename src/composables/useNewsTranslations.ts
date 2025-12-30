/**
 * News Translations Composable
 * Business logic for news translation management
 * Following Single Responsibility Principle and Composition API best practices
 */

import { ref, computed } from "vue";
import { newsTranslationRepository } from "@/services/repositories/NewsTranslationRepository";
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
import { handleConvexError, getErrorMessage } from "@/utils/errorHandler";

/**
 * Composable for managing news translations
 */
export function useNewsTranslations() {
  const translation = ref<NewsTranslation | null>(null);
  const newsWithTranslation = ref<NewsWithTranslation | null>(null);
  const newsWithCoverage = ref<NewsWithCoverage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  let unsubscribe: (() => void) | null = null;

  /**
   * Load translation for a specific news item and locale
   */
  const loadTranslation = (newsId: NewsId, locale: Locale) => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = newsTranslationRepository.getTranslation(newsId, locale)({
      onUpdate: (result) => {
        translation.value = result;
        isLoading.value = false;
        error.value = null;
      },
      onError: (err) => {
        const appError = handleConvexError(err);
        error.value = getErrorMessage(appError);
        isLoading.value = false;
      },
    });
  };

  /**
   * Load news with translation (effective content)
   */
  const loadNewsWithTranslation = (newsId: NewsId, locale: Locale) => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = newsTranslationRepository.getNewsWithTranslation(newsId, locale)({
      onUpdate: (result) => {
        newsWithTranslation.value = result;
        isLoading.value = false;
        error.value = null;
      },
      onError: (err) => {
        const appError = handleConvexError(err);
        error.value = getErrorMessage(appError);
        isLoading.value = false;
      },
    });
  };

  /**
   * Load news list with translation coverage
   */
  const loadNewsWithCoverage = (filters?: NewsListFilters) => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = newsTranslationRepository.listNewsForAdmin(filters)({
      onUpdate: (result) => {
        newsWithCoverage.value = result;
        isLoading.value = false;
        error.value = null;
      },
      onError: (err) => {
        const appError = handleConvexError(err);
        error.value = getErrorMessage(appError);
        isLoading.value = false;
      },
    });
  };

  /**
   * Upsert translation (create or update)
   */
  const upsertTranslation = async (
    input: CreateTranslationInput | UpdateTranslationInput
  ): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await newsTranslationRepository.upsertTranslation(input);
      isLoading.value = false;
      return true;
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = getErrorMessage(appError);
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Delete translation
   */
  const deleteTranslation = async (newsId: NewsId, locale: Locale): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await newsTranslationRepository.deleteTranslation(newsId, locale);
      isLoading.value = false;
      return true;
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = getErrorMessage(appError);
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Set translation status
   */
  const setTranslationStatus = async (
    newsId: NewsId,
    locale: Locale,
    status: "draft" | "review" | "published"
  ): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await newsTranslationRepository.setTranslationStatus(newsId, locale, status);
      isLoading.value = false;
      return true;
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = getErrorMessage(appError);
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Create missing translations
   */
  const createMissingTranslations = async (newsId: NewsId): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await newsTranslationRepository.createMissingTranslations(newsId);
      isLoading.value = false;
      return true;
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = getErrorMessage(appError);
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Cleanup subscription
   */
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  return {
    // State
    translation: computed(() => translation.value),
    newsWithTranslation: computed(() => newsWithTranslation.value),
    newsWithCoverage: computed(() => newsWithCoverage.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Actions
    loadTranslation,
    loadNewsWithTranslation,
    loadNewsWithCoverage,
    upsertTranslation,
    deleteTranslation,
    setTranslationStatus,
    createMissingTranslations,
    clearError,
    cleanup,
  };
}

