/**
 * Convex Client Service
 * Abstracted service for Convex client operations
 * Following Dependency Inversion Principle
 */

import { ConvexClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { CONFIG } from "@/constants";
import { handleConvexError, logError } from "@/utils/errorHandler";
import * as keycloakLib from "@/lib/keycloak";

/**
 * Interface for Convex client operations
 * Following Interface Segregation Principle
 */
export interface IConvexClientService {
  isAvailable(): boolean;
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
  private client: ConvexClient | null = null;
  private url: string;

  constructor() {
    this.url = CONFIG.convex.url;
    
    if (!this.url || this.url.trim() === "") {
      console.warn(
        "⚠️ VITE_CONVEX_URL is not set. Please set it in your .env file.\n" +
        "Convex features will not work until the URL is configured.\n" +
        "See env.example for reference."
      );
      // Don't initialize client with invalid URL
      return;
    }

    // Validate URL format
    if (!this.url.startsWith("https://") && !this.url.startsWith("http://")) {
      console.error(
        "❌ Invalid VITE_CONVEX_URL: Must start with 'https://' or 'http://'.\n" +
        `Found: "${this.url}"`
      );
      return;
    }

    try {
      this.client = new ConvexClient(this.url);
    } catch (error) {
      console.error("❌ Failed to initialize Convex client:", error);
      this.client = null;
    }
  }

  /**
   * Ensures client is initialized, throws error if not configured
   */
  private ensureClient(): ConvexClient {
    if (!this.client) {
      throw new Error(
        "Convex client is not initialized. Please set VITE_CONVEX_URL in your .env file.\n" +
        "See env.example for reference."
      );
    }
    return this.client;
  }

  /**
   * Checks if client is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Sets authentication token for Convex client
   * Convex expects a function that returns a Promise<string | null>
   * We use a dynamic function that fetches the current token each time,
   * so token refreshes are automatically picked up
   */
  setAuth(token: string | null): void {
    if (!this.isAvailable()) {
      console.warn("Cannot set auth: Convex client is not initialized");
      return;
    }
    if (token) {
      // Convex's setAuth expects a function that returns a Promise<string | null>
      // We use a dynamic function that fetches the current token from Keycloak each time
      // This ensures token refreshes are automatically picked up
      this.client!.setAuth(async () => {
        const currentToken = keycloakLib.getAccessToken();
        return currentToken;
      });
    } else {
      // Clear auth by setting it to null
      const client = this.ensureClient();
      if (typeof (client as any).setAuth === 'function') {
        (client as any).setAuth(async () => null);
      } else if (typeof (client as any).clearAuth === 'function') {
        (client as any).clearAuth();
      }
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
    if (!this.isAvailable()) {
      const error = new Error("Convex client is not initialized. Please set VITE_CONVEX_URL.");
      callbacks.onError(error);
      return () => {}; // Return no-op unsubscribe function
    }

    try {
      const client = this.ensureClient();
      
      // In Convex browser client, use onUpdate to subscribe to query updates
      // onUpdate signature: onUpdate(query, args, callback) returns unsubscribe function
      if (typeof (client as any).onUpdate === 'function') {
        return (client as any).onUpdate(query as any, args || {}, (result: any) => {
          try {
            callbacks.onUpdate(result);
          } catch (error) {
            const appError = handleConvexError(error);
            logError(appError, "ConvexQuery");
            callbacks.onError(error as Error);
          }
        });
      } else {
        throw new Error("Convex client does not have onUpdate method");
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
    if (!this.isAvailable()) {
      throw new Error("Convex client is not initialized. Please set VITE_CONVEX_URL.");
    }

    try {
      return await this.client!.mutation(mutation as any, args);
    } catch (error) {
      const appError = handleConvexError(error);
      logError(appError, "ConvexMutation");
      throw error;
    }
  }
}

// Export singleton instance
export const convexClientService = new ConvexClientService();

