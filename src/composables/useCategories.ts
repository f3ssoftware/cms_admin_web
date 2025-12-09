/**
 * Categories Composable
 * Business logic for category management
 * Following Single Responsibility Principle and Composition API best practices
 */

import { ref, computed } from "vue";
import { categoryRepository } from "@/services/repositories";
import type { Category, CategoryId, CreateCategoryInput, UpdateCategoryInput } from "@/types";
import { validateCategory, generateSlug } from "@/utils/validation";
import { handleConvexError, getErrorMessage } from "@/utils/errorHandler";

/**
 * Composable for managing categories
 */
export function useCategories() {
  const categories = ref<Category[]>([]);
  const currentCategory = ref<Category | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  let unsubscribe: (() => void) | null = null;

  /**
   * Load all categories
   */
  const loadCategories = () => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = categoryRepository.list()({
      onUpdate: (result) => {
        categories.value = result;
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
   * Load a single category by ID
   */
  const loadCategory = (id: CategoryId) => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = categoryRepository.get(id)({
      onUpdate: (result) => {
        currentCategory.value = result;
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
   * Create a new category
   */
  const createCategory = async (input: CreateCategoryInput): Promise<CategoryId | null> => {
    // Validate input
    const validation = validateCategory(input);
    if (!validation.valid) {
      error.value = validation.errors.join(", ");
      return null;
    }

    // Generate slug if not provided
    if (!input.slug) {
      input.slug = generateSlug(input.name);
    }

    isLoading.value = true;
    error.value = null;

    try {
      const id = await categoryRepository.create(input);
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
   * Update an existing category
   */
  const updateCategory = async (input: UpdateCategoryInput): Promise<boolean> => {
    // Validate input if name or slug is being updated
    if (input.name || input.slug) {
      const current = categories.value.find((c) => c._id === input.id);
      const validation = validateCategory({
        name: input.name || current?.name || "",
        slug: input.slug || current?.slug || "",
        description: input.description,
      });
      if (!validation.valid) {
        error.value = validation.errors.join(", ");
        return false;
      }
    }

    isLoading.value = true;
    error.value = null;

    try {
      await categoryRepository.update(input);
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
   * Delete a category
   */
  const deleteCategory = async (id: CategoryId): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await categoryRepository.delete(id);
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
    categories: computed(() => categories.value),
    currentCategory: computed(() => currentCategory.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Actions
    loadCategories,
    loadCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
    cleanup,
  };
}



