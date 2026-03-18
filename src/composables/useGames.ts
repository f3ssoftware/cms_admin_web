import { computed } from "vue";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convexClientService } from "@/services/convex/ConvexClientService";
import { useConvexQuery } from "@/composables/useConvex";

export interface Game {
  _id: Id<"games">;
  _creationTime: number;
  name: string;
  image: string;
  slug: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export const useGames = () => {
  const { data, isLoading } = useConvexQuery(api.games.list, {});
  const games = computed(() => data.value ?? []);

  return {
    games,
    isLoading,
  };
};

export const useGame = (id: Id<"games"> | null) => {
  const { data, isLoading } = useConvexQuery(api.games.get, id ? { id } : ({} as any));
  const game = computed(() => (id ? (data.value ?? null) : null));

  return {
    game,
    isLoading,
  };
};

export const useCreateGame = () => {
  return (args: any) => convexClientService.mutation(api.games.create as any, args);
};

export const useUpdateGame = () => {
  return (args: any) => convexClientService.mutation(api.games.update as any, args);
};

export const useDeleteGame = () => {
  return (args: any) => convexClientService.mutation(api.games.remove as any, args);
};


