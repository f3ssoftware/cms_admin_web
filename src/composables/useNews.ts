/**
 * News Composable
 * Business logic for news management
 * Following Single Responsibility Principle and Composition API best practices
 */

import { ref, computed } from "vue";
import { newsRepository } from "@/services/repositories";
import type {
  News,
  NewsId,
  CreateNewsInput,
  UpdateNewsInput,
  NewsListFilters,
} from "@/types";
import { validateNews } from "@/utils/validation";
import { handleConvexError, getErrorMessage } from "@/utils/errorHandler";
import { useAuthStore } from "@/stores/auth";

/**
 * Composable for managing news articles
 */
export function useNews() {
  const news = ref<News[]>([]);
  const currentNews = ref<News | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const authStore = useAuthStore();

  let unsubscribe: (() => void) | null = null;

  /**
   * Load all news articles with optional filters
   */
  const loadNews = (filters?: NewsListFilters) => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = newsRepository.list(filters)({
      onUpdate: (result) => {
        news.value = result;
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
   * Load a single news article by ID
   */
  const loadNewsItem = (id: NewsId) => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = newsRepository.get(id)({
      onUpdate: (result) => {
        currentNews.value = result;
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
   * Create a new news article
   */
  const createNews = async (input: Omit<CreateNewsInput, "authorId">): Promise<NewsId | null> => {
    if (!authStore.user) {
      error.value = "You must be logged in to create news";
      return null;
    }

    // Validate input
    const fullInput: CreateNewsInput = {
      ...input,
      authorId: authStore.user.id,
    };

    const validation = validateNews(fullInput);
    if (!validation.valid) {
      error.value = validation.errors.join(", ");
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const id = await newsRepository.create(fullInput);
      isLoading.value = false;
      return id;
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = getErrorMessage(appError);
      isLoading.value = false;
      return null;
    }
  };

  /**
   * Update an existing news article
   */
  const updateNews = async (input: UpdateNewsInput): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await newsRepository.update(input);
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
   * Delete a news article
   */
  const deleteNews = async (id: NewsId): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await newsRepository.delete(id);
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
    news: computed(() => news.value),
    currentNews: computed(() => currentNews.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Actions
    loadNews,
    loadNewsItem,
    createNews,
    updateNews,
    deleteNews,
    clearError,
    cleanup,
  };
}

