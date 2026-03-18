/**
 * Games composable — uses ConvexClientService + repository (same auth as News/Categories).
 * Avoids convex/react, which is for React and can cause confusing runtime issues in Vue.
 */

import { ref, onMounted, onUnmounted } from "vue";
import {
  gameRepository,
  type GameRow,
} from "@/services/repositories/GameRepository";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export type Game = GameRow;

export function useGames() {
  const games = ref<Game[]>([]);
  const isLoading = ref(true);
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = gameRepository.list()({
      onUpdate: (result) => {
        games.value = result;
        isLoading.value = false;
      },
      onError: () => {
        isLoading.value = false;
      },
    });
  });

  onUnmounted(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  return { games, isLoading };
}

export function useGame(id: Id<"games"> | null) {
  const game = ref<Game | null>(null);
  const isLoading = ref(true);
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = gameRepository.get(id)({
      onUpdate: (result) => {
        game.value = result;
        isLoading.value = false;
      },
      onError: () => {
        isLoading.value = false;
      },
    });
  });

  onUnmounted(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  return { game, isLoading };
}

export function useCreateGame() {
  return (input: {
    name: string;
    image: string;
    slug: string;
    description?: string;
  }) => gameRepository.create(input);
}

export function useUpdateGame() {
  return (input: {
    id: Id<"games">;
    name?: string;
    image?: string;
    slug?: string;
    description?: string;
  }) => gameRepository.update(input);
}

export function useDeleteGame() {
  return (id: Id<"games">) => gameRepository.remove(id);
}
