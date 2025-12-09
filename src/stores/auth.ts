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
  const hasValidToken = ref(false); // Track token validity reactively

  // Computed
  const isAuthenticated = computed(() => {
    return hasValidToken.value && user.value !== null;
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
        hasValidToken.value = true;
        await syncUser();
        keycloakLib.setupTokenRefresh();
        syncConvexAuth();
      } else {
        hasValidToken.value = false;
        // Not authenticated is not an error - user just needs to login
        console.log("User not authenticated. Redirect to login when accessing protected routes.");
      }
    } catch (err) {
      // Only log errors, don't block app initialization
      const appError = handleConvexError(err);
      error.value = err as Error;
      logError(appError, "AuthInit");
      console.warn("Keycloak initialization failed, but app will continue:", err);
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
    console.log("syncUser called, userInfo from keycloakLib:", userInfo);
    if (userInfo) {
      user.value = {
        id: userInfo.id,
        username: userInfo.username || "",
        email: userInfo.email || "",
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        roles: userInfo.roles,
      };
      console.log("User synced to store:", user.value);
    } else {
      console.warn("No userInfo available from keycloakLib");
      user.value = null;
    }
  }

  /**
   * Sync Convex authentication token
   * Following Single Responsibility Principle
   */
  function syncConvexAuth(): void {
    const token = keycloakLib.getAccessToken();
    if (token) {
      convexClientService.setAuth(token);
    } else {
      convexClientService.setAuth(null);
    }
  }

  /**
   * Login function - uses Direct Access Grants (username/password)
   */
  async function login(username: string, password: string): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      await keycloakLib.loginKeycloak(username, password);
      // After successful login, sync user state
      hasValidToken.value = true; // Mark token as valid
      await syncUser();
      syncConvexAuth();
      keycloakLib.setupTokenRefresh();
      
      // Debug: Verify authentication state after login
      console.log("Login completed, auth state:", {
        isAuthenticated: isAuthenticated.value,
        hasUser: !!user.value,
        hasValidToken: hasValidToken.value,
        keycloakAuth: keycloakLib.isAuthenticated(),
        user: user.value
      });
    } catch (err) {
      hasValidToken.value = false;
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
      hasValidToken.value = false;
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
        hasValidToken.value = true;
        syncConvexAuth();
        await syncUser();
      } else {
        hasValidToken.value = false;
      }
      return refreshed;
    } catch (err) {
      hasValidToken.value = false;
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

  // Note: Event listeners removed - we're using Direct Access Grants flow
  // Token refresh is handled by setupTokenRefresh() called after login

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
