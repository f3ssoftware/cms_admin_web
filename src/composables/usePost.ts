/**
 * usePost Composable
 * Provides reactive state and methods for managing posts
 * Following Composition API patterns and Single Responsibility Principle
 */

import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { postRepository } from "@/services/repositories/PostRepository";
import type {
  Post,
  PostId,
  CreatePostInput,
  UpdatePostInput,
  PostListFilters,
} from "@/types";
import { validatePost } from "@/utils/validation";
import { handleConvexError, getErrorMessage } from "@/utils/errorHandling";

export function usePost() {
  const authStore = useAuthStore();

  // State
  const posts = ref<Post[]>([]);
  const currentPost = ref<Post | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasPosts = computed(() => posts.value.length > 0);
  const publishedPosts = computed(() =>
    posts.value.filter((post) => post.published)
  );
  const draftPosts = computed(() =>
    posts.value.filter((post) => !post.published)
  );

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Create a new post
   * Extracts author name from JWT token (name, firstName + lastName, or username)
   */
  const createPost = async (
    input: Omit<CreatePostInput, "authorId" | "authorName">
  ): Promise<PostId | null> => {
    if (!authStore.user) {
      error.value = "You must be logged in to create a post";
      return null;
    }

    // Extract author name from JWT token
    // Priority: name (full name) > firstName + lastName > username
    let authorName: string | undefined;
    if (authStore.user.name) {
      // Use full name from JWT if available (e.g., "Felipe Sampaio")
      authorName = authStore.user.name;
    } else if (authStore.user.firstName && authStore.user.lastName) {
      // Fallback to firstName + lastName
      authorName = `${authStore.user.firstName} ${authStore.user.lastName}`;
    } else if (authStore.user.firstName) {
      // Fallback to firstName only
      authorName = authStore.user.firstName;
    } else if (authStore.user.username) {
      // Final fallback to username
      authorName = authStore.user.username;
    }

    // Validate input
    const fullInput: CreatePostInput = {
      ...input,
      authorId: authStore.user.id,
      authorName, // Include author name from JWT
    };

    const validation = validatePost(fullInput);
    if (!validation.valid) {
      error.value = validation.errors.join(", ");
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const id = await postRepository.create(fullInput);
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
   * Update an existing post
   */
  const updatePost = async (input: UpdatePostInput): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await postRepository.update(input);
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
   * Delete a post
   */
  const deletePost = async (id: PostId): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      await postRepository.delete(id);
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
   * Watch posts list with filters
   */
  const watchPosts = (filters?: PostListFilters) => {
    return postRepository.list(filters)({
      onUpdate: (result) => {
        posts.value = result;
      },
      onError: (err) => {
        error.value = err.message;
      },
    });
  };

  /**
   * Watch a single post by ID
   */
  const watchPost = (id: PostId) => {
    return postRepository.get(id)({
      onUpdate: (result) => {
        currentPost.value = result;
      },
      onError: (err) => {
        error.value = err.message;
      },
    });
  };

  /**
   * Watch posts by author
   */
  const watchPostsByAuthor = (authorId: string) => {
    return postRepository.getByAuthor(authorId)({
      onUpdate: (result) => {
        posts.value = result;
      },
      onError: (err) => {
        error.value = err.message;
      },
    });
  };

  return {
    // State
    posts,
    currentPost,
    isLoading,
    error,
    // Computed
    hasPosts,
    publishedPosts,
    draftPosts,
    // Methods
    createPost,
    updatePost,
    deletePost,
    watchPosts,
    watchPost,
    watchPostsByAuthor,
    clearError,
  };
}

