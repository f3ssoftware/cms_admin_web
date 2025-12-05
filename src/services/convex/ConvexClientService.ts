/**
 * Convex Client Service
 * Abstracted service for Convex client operations
 * Following Dependency Inversion Principle
 */

import { ConvexClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { CONFIG } from "@/constants";
import { handleConvexError, logError } from "@/utils/errorHandler";

/**
 * Interface for Convex client operations
 * Following Interface Segregation Principle
 */
export interface IConvexClientService {
  setAuth(token: string | null): void;
  watchQuery<Query extends FunctionReference<"query", "public", any, any>>(
    query: Query,
    args: Query["_args"],
    callbacks: {
      onUpdate: (result: Query["_returnType"]) => void;
      onError: (error: Error) => void;
    }
  ): () => void;
  mutation<Mutation extends FunctionReference<"mutation", "public", any, any>>(
    mutation: Mutation,
    args: Mutation["_args"]
  ): Promise<Mutation["_returnType"]>;
}

/**
 * Convex Client Service Implementation
 * Following Single Responsibility Principle
 */
class ConvexClientService implements IConvexClientService {
  private client: ConvexClient;

  constructor() {
    const url = CONFIG.convex.url;
    
    if (!url) {
      console.warn("VITE_CONVEX_URL is not set. Please set it in your .env file.");
    }

    this.client = new ConvexClient(url);
  }

  /**
   * Sets authentication token for Convex client
   */
  setAuth(token: string | null): void {
    if (token) {
      this.client.setAuth(token);
    } else {
      this.client.clearAuth();
    }
  }

  /**
   * Watches a Convex query and calls callbacks on updates
   */
  watchQuery<Query extends FunctionReference<"query", "public", any, any>>(
    query: Query,
    args: Query["_args"],
    callbacks: {
      onUpdate: (result: Query["_returnType"]) => void;
      onError: (error: Error) => void;
    }
  ): () => void {
    try {
      return this.client.watchQuery(query as any, args || {}, {
        onUpdate: callbacks.onUpdate,
        onError: (error) => {
          const appError = handleConvexError(error);
          logError(appError, "ConvexQuery");
          callbacks.onError(error);
        },
      });
    } catch (error) {
      const appError = handleConvexError(error);
      logError(appError, "ConvexQuery");
      callbacks.onError(error as Error);
      return () => {}; // Return no-op unsubscribe function
    }
  }

  /**
   * Executes a Convex mutation
   */
  async mutation<Mutation extends FunctionReference<"mutation", "public", any, any>>(
    mutation: Mutation,
    args: Mutation["_args"]
  ): Promise<Mutation["_returnType"]> {
    try {
      return await this.client.mutation(mutation as any, args);
    } catch (error) {
      const appError = handleConvexError(error);
      logError(appError, "ConvexMutation");
      throw error;
    }
  }
}

// Export singleton instance
export const convexClientService = new ConvexClientService();

