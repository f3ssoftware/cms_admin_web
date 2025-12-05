/**
 * Convex Composables
 * @deprecated Use specific composables like useCategories, useNews instead
 * These are kept for backward compatibility
 * Following Single Responsibility Principle
 */

import { ref, onMounted, onUnmounted } from "vue";
import { convexClientService } from "@/services/convex/ConvexClientService";
import type { FunctionReference } from "convex/server";
import { handleConvexError, getErrorMessage } from "@/utils/errorHandler";

/**
 * Composable for using Convex queries in Vue components
 * @deprecated Use repository-based composables instead
 */
export function useConvexQuery<
  Query extends FunctionReference<"query", "public", any, any>
>(query: Query, args?: Query["_args"]) {
  const data = ref<Query["_returnType"] | undefined>(undefined);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  let unsubscribe: (() => void) | null = null;

  const subscribe = () => {
    if (unsubscribe) {
      unsubscribe();
    }

    isLoading.value = true;
    error.value = null;

    unsubscribe = convexClientService.watchQuery(query as any, args || {}, {
      onUpdate: (result) => {
        data.value = result;
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

  onMounted(() => {
    subscribe();
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    data,
    isLoading,
    error,
    refetch: subscribe,
  };
}

/**
 * Composable for using Convex mutations
 * @deprecated Use repository-based composables instead
 */
export function useConvexMutation<
  Mutation extends FunctionReference<"mutation", "public", any, any>
>(mutation: Mutation) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const mutate = async (args: Mutation["_args"]): Promise<Mutation["_returnType"] | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await convexClientService.mutation(mutation as any, args);
      isLoading.value = false;
      return result;
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = getErrorMessage(appError);
      isLoading.value = false;
      throw err;
    }
  };

  return {
    mutate,
    isLoading,
    error,
  };
}

