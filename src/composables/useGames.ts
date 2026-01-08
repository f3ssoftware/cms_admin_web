import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

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
  const games = useQuery(api.games.list);
  const isLoading = games === undefined;

  return {
    games: games || [],
    isLoading,
  };
};

export const useGame = (id: Id<"games"> | null) => {
  const game = useQuery(api.games.get, id ? { id } : "skip");
  const isLoading = game === undefined;

  return {
    game: game || null,
    isLoading,
  };
};

export const useCreateGame = () => {
  return useMutation(api.games.create);
};

export const useUpdateGame = () => {
  return useMutation(api.games.update);
};

export const useDeleteGame = () => {
  return useMutation(api.games.remove);
};


