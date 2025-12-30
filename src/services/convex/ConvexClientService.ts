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
  setAuth(fetchToken: (() => Promise<string | null>) | null): void;
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
    
    if (!url || url.trim() === "" || url === "https://your-deployment.convex.cloud") {
      const errorMessage = "VITE_CONVEX_URL is not set or is using the placeholder value. Please set it in your .env file with a valid Convex deployment URL from https://dashboard.convex.dev";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.client = new ConvexClient(url);
  }

  /**
   * Sets authentication token for Convex client
   * Convex expects a function that returns a Promise resolving to the token
   */
  setAuth(fetchToken: (() => Promise<string | null>) | null): void {
    if (fetchToken) {
      this.client.setAuth(fetchToken);
    } else {
      this.client.clearAuth();
    }
  }

  /**
   * Watches a Convex query and calls callbacks on updates
   * Note: Convex browser client uses onUpdate for reactive queries
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
      // Convex browser client uses onUpdate method for reactive queries
      // The pattern is: client.onUpdate(query, args, callback) returns unsubscribe function
      if (typeof (this.client as any).onUpdate === 'function') {
        const unsubscribe = (this.client as any).onUpdate(
          query as any,
          args || {},
          (result: any) => {
            try {
              callbacks.onUpdate(result);
            } catch (error) {
              const appError = handleConvexError(error);
              logError(appError, "ConvexQuery");
              callbacks.onError(error as Error);
            }
          }
        );
        return unsubscribe || (() => {});
      } else {
        // Fallback: Use query with polling if onUpdate doesn't exist
        console.warn("Convex client onUpdate not available, using polling fallback");
        let isActive = true;
        let pollInterval: number | null = null;
        
        const poll = async () => {
          if (!isActive) return;
          try {
            const result = await (this.client as any).query(query as any, args || {});
            if (isActive) {
              callbacks.onUpdate(result);
            }
          } catch (error) {
            if (isActive) {
              const appError = handleConvexError(error);
              logError(appError, "ConvexQuery");
              callbacks.onError(error as Error);
            }
          }
        };
        
        // Initial call
        poll();
        // Poll every 2 seconds
        pollInterval = window.setInterval(poll, 2000);
        
        return () => {
          isActive = false;
          if (pollInterval !== null) {
            clearInterval(pollInterval);
          }
        };
      }
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

