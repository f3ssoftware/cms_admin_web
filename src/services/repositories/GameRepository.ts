/**
 * Game Repository — Convex access via shared ConvexClientService (Vue-safe).
 * Do not use convex/react hooks here; they target React and a separate client.
 */

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { convexClientService } from "../convex/ConvexClientService";

export interface GameRow {
  _id: Id<"games">;
  _creationTime: number;
  name: string;
  image: string;
  slug: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export class GameRepository {
  list(): (callbacks: {
    onUpdate: (result: GameRow[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) =>
      convexClientService.watchQuery(api.games.list, {}, callbacks);
  }

  get(
    id: Id<"games"> | null
  ): (callbacks: {
    onUpdate: (result: GameRow | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      if (!id) {
        callbacks.onUpdate(null);
        return () => {};
      }
      return convexClientService.watchQuery(api.games.get, { id }, callbacks);
    };
  }

  async create(input: {
    name: string;
    image: string;
    slug: string;
    description?: string;
  }): Promise<Id<"games">> {
    return convexClientService.mutation(api.games.create, input);
  }

  async update(input: {
    id: Id<"games">;
    name?: string;
    image?: string;
    slug?: string;
    description?: string;
  }): Promise<void> {
    await convexClientService.mutation(api.games.update, input);
  }

  async remove(id: Id<"games">): Promise<void> {
    await convexClientService.mutation(api.games.remove, { id });
  }
}

export const gameRepository = new GameRepository();
