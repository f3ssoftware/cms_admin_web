/**
 * Keycloak Service
 * Following Single Responsibility Principle
 */

import Keycloak from "keycloak-js";
import { CONFIG } from "@/constants";

// Keycloak configuration from centralized config
const keycloakConfig = {
  url: CONFIG.keycloak.url,
  realm: CONFIG.keycloak.realm,
  clientId: CONFIG.keycloak.clientId,
};

// Initialize Keycloak instance
export const keycloak = new Keycloak(keycloakConfig);

// Initialize Keycloak and return a promise
export async function initKeycloak(): Promise<boolean> {
  try {
    // Add timeout to prevent hanging
    const initPromise = keycloak.init({
      onLoad: "check-sso", // Check SSO on load
      // Disable silent SSO check to avoid timeout issues with iframe
      // silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false, // Disable iframe check to avoid timeout issues
      enableLogging: import.meta.env.DEV, // Enable logging in development
      messageReceiveTimeout: 5000, // 5 second timeout for messages
    });

    // Add a timeout wrapper
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Keycloak initialization timeout after 10 seconds"));
      }, 10000);
    });

    const authenticated = await Promise.race([initPromise, timeoutPromise]).catch((err) => {
      console.warn("Keycloak initialization timeout or error:", err);
      return false;
    }) as boolean;
    
    return authenticated;
  } catch (error) {
    console.error("Failed to initialize Keycloak", error);
    // Don't throw - allow app to continue without authentication
    // User can still try to login manually
    return false;
  }
}

// Login function
export async function loginKeycloak(): Promise<void> {
  try {
    console.log("Keycloak login called, redirecting to Keycloak...");
    await keycloak.login({
      redirectUri: window.location.origin + "/dashboard",
    });
    console.log("Keycloak login redirect initiated");
  } catch (error) {
    console.error("Failed to login with Keycloak", error);
    throw error;
  }
}

// Logout function
export async function logoutKeycloak(): Promise<void> {
  try {
    await keycloak.logout({
      redirectUri: window.location.origin,
    });
  } catch (error) {
    console.error("Failed to logout from Keycloak", error);
    throw error;
  }
}

// Get user info from Keycloak token
export function getUserInfo() {
  if (!keycloak.authenticated || !keycloak.tokenParsed) {
    return null;
  }

  const token = keycloak.tokenParsed as any;
  return {
    id: token.sub, // Keycloak user ID
    username: token.preferred_username || token.username,
    email: token.email,
    firstName: token.given_name,
    lastName: token.family_name,
    roles: token.realm_access?.roles || [],
  };
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return keycloak.authenticated || false;
}

// Get access token
export function getAccessToken(): string | null {
  return keycloak.token || null;
}

// Refresh token
export async function refreshToken(): Promise<boolean> {
  try {
    return await keycloak.updateToken(30); // Refresh if token expires within 30 seconds
  } catch (error) {
    console.error("Failed to refresh token", error);
    return false;
  }
}

// Set up token refresh interval
export function setupTokenRefresh() {
  // Refresh token every 5 minutes
  setInterval(async () => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);
      } catch (error) {
        console.error("Token refresh failed", error);
      }
    }
  }, 5 * 60 * 1000);
}

