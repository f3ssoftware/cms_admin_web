/**
 * Authentication Store
 * Refactored following SOLID principles and Vue 3 Composition API best practices
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as keycloakLib from "@/lib/keycloak";
import { convexClientService } from "@/services/convex/ConvexClientService";
import type { User } from "@/types";
import { handleConvexError, logError } from "@/utils/errorHandler";

/**
 * Authentication Store
 * Following Single Responsibility Principle - only handles authentication state
 */
export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Computed
  const isAuthenticated = computed(() => {
    return keycloakLib.isAuthenticated() && user.value !== null;
  });

  /**
   * Initialize Keycloak and sync user state
   * Following Open/Closed Principle - can be extended without modification
   */
  async function init(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const authenticated = await keycloakLib.initKeycloak();

      if (authenticated) {
        await syncUser();
        keycloakLib.setupTokenRefresh();
        syncConvexAuth();
        // Don't redirect here - let the router guard handle it
      }
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = err as Error;
      logError(appError, "AuthInit");
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Sync user info from Keycloak token
   * Following Single Responsibility Principle
   */
  async function syncUser(): Promise<void> {
    const userInfo = keycloakLib.getUserInfo();
    if (userInfo) {
      user.value = {
        id: userInfo.id,
        username: userInfo.username || "",
        email: userInfo.email || "",
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        roles: userInfo.roles,
      };
    } else {
      user.value = null;
    }
  }

  /**
   * Sync Convex authentication token
   * Following Single Responsibility Principle
   * Convex expects a function that returns a Promise resolving to the token
   */
  function syncConvexAuth(): void {
    const token = keycloakLib.getAccessToken();
    if (token) {
      // Convex expects a function that returns a Promise with the token
      convexClientService.setAuth(async () => {
        // Get the current token (it might have been refreshed)
        const currentToken = keycloakLib.getAccessToken();
        return currentToken || null;
      });
    } else {
      convexClientService.setAuth(null);
    }
  }

  /**
   * Login function - redirects to Keycloak login
   */
  async function login(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      await keycloakLib.loginKeycloak();
      // After login, Keycloak will redirect back
      // The init function will be called again to sync user state
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = err as Error;
      logError(appError, "AuthLogin");
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout function - redirects to Keycloak logout
   */
  async function logout(): Promise<void> {
    try {
      isLoading.value = true;
      user.value = null;
      convexClientService.setAuth(null);
      await keycloakLib.logoutKeycloak();
    } catch (err) {
      const appError = handleConvexError(err);
      error.value = err as Error;
      logError(appError, "AuthLogout");
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get access token for API calls
   */
  function getAccessToken(): string | null {
    return keycloakLib.getAccessToken();
  }

  /**
   * Get auth header for API calls
   */
  function getAuthHeader(): string | null {
    const token = getAccessToken();
    if (!token) return null;
    return `Bearer ${token}`;
  }

  /**
   * Refresh token
   */
  async function refreshToken(): Promise<boolean> {
    try {
      const refreshed = await keycloakLib.refreshToken();
      if (refreshed) {
        syncConvexAuth();
        await syncUser();
      }
      return refreshed;
    } catch (err) {
      const appError = handleConvexError(err);
      logError(appError, "AuthRefreshToken");
      return false;
    }
  }

  /**
   * Clear error
   */
  function clearError(): void {
    error.value = null;
  }

  // Setup Keycloak event listeners
  if (typeof window !== "undefined") {
    keycloakLib.keycloak.onAuthSuccess = async () => {
      await syncUser();
      syncConvexAuth();
      // Don't redirect here - let the router guard handle it
    };

    keycloakLib.keycloak.onAuthLogout = () => {
      user.value = null;
      convexClientService.setAuth(null);
    };

    keycloakLib.keycloak.onTokenExpired = async () => {
      await refreshToken();
    };
  }

  return {
    // State
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAuthenticated,

    // Actions
    init,
    login,
    logout,
    getAccessToken,
    getAuthHeader,
    refreshToken,
    syncUser,
    clearError,
  };
});
